import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

interface ItemDecision {
  supplierProductName: string;
  description?: string;
  hsnCode?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  lineTotal: number;
  action: 'map' | 'create' | 'ignore';
  // For 'map' action
  rawMaterialId?: string;
  productId?: string;
  // For 'create' action
  newProduct?: {
    name: string;
    sku: string;
    unit: string;
    categoryId?: string;
    type: 'rawMaterial' | 'product';
    minStock?: number;
  };
}

interface ApprovePayload {
  supplierName: string;
  supplierGst?: string;
  supplierId?: string;
  invoiceNumber: string;
  invoiceDate?: string;
  poNumber?: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  freight: number;
  packingCharges: number;
  roundOff: number;
  totalAmount: number;
  warehouseId: string;
  rawOcrJson?: string;
  items: ItemDecision[];
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId, userId } = session;
    const body: ApprovePayload = await req.json();

    const {
      supplierName, supplierGst, supplierId, invoiceNumber, invoiceDate,
      poNumber, subtotal, cgst, sgst, igst, freight, packingCharges,
      roundOff, totalAmount, warehouseId, rawOcrJson, items,
    } = body;

    // Validate warehouse
    const warehouse = await db.warehouse.findFirst({
      where: { id: warehouseId, companyId, deletedAt: null },
    });
    if (!warehouse) {
      return NextResponse.json({ error: 'Selected warehouse not found' }, { status: 404 });
    }

    // Run everything in a single atomic transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Find or create supplier
      let resolvedSupplierId = supplierId || null;
      if (!resolvedSupplierId && supplierName) {
        const existingSupplier = await tx.supplier.findFirst({
          where: { companyId, name: { contains: supplierName, mode: 'insensitive' }, deletedAt: null },
        });
        if (existingSupplier) {
          resolvedSupplierId = existingSupplier.id;
        } else {
          const newSupplier = await tx.supplier.create({
            data: { companyId, name: supplierName },
          });
          resolvedSupplierId = newSupplier.id;
        }
      }

      // 2. Create PurchaseInvoice header
      const purchaseInvoice = await tx.purchaseInvoice.create({
        data: {
          companyId,
          supplierId: resolvedSupplierId,
          supplierName,
          supplierGst: supplierGst || null,
          invoiceNumber,
          invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
          poNumber: poNumber || null,
          subtotal,
          cgst,
          sgst,
          igst,
          freight,
          packingCharges,
          roundOff,
          totalAmount,
          status: 'Posted',
          rawOcrJson: rawOcrJson || null,
        },
      });

      // 3. Process each line item
      const processedItems: string[] = [];
      const aliasesToSave: Array<{ supplierName: string; internalName: string; rawMaterialId?: string; productId?: string }> = [];

      for (const item of items) {
        if (item.action === 'ignore') continue;

        let finalRawMaterialId = item.rawMaterialId || null;
        let finalProductId = item.productId || null;
        let internalName = item.supplierProductName;

        if (item.action === 'create' && item.newProduct) {
          // Create new RawMaterial or Product
          if (item.newProduct.type === 'rawMaterial') {
            const newRM = await tx.rawMaterial.create({
              data: {
                companyId,
                name: item.newProduct.name,
                sku: item.newProduct.sku,
                unit: item.newProduct.unit || 'pcs',
                cost: item.unitPrice,
                minStock: item.newProduct.minStock || 0,
                categoryId: item.newProduct.categoryId || null,
              },
            });
            finalRawMaterialId = newRM.id;
            internalName = newRM.name;
          } else {
            const newProduct = await tx.product.create({
              data: {
                companyId,
                name: item.newProduct.name,
                sku: item.newProduct.sku,
                unit: item.newProduct.unit || 'pcs',
                cost: item.unitPrice,
                categoryId: item.newProduct.categoryId || null,
                type: 'Finished',
              },
            });
            finalProductId = newProduct.id;
            internalName = newProduct.name;
          }
        }

        // Save alias if supplier name differs from internal name
        if (item.supplierProductName.toLowerCase() !== internalName.toLowerCase()) {
          aliasesToSave.push({
            supplierName: item.supplierProductName,
            internalName,
            rawMaterialId: finalRawMaterialId || undefined,
            productId: finalProductId || undefined,
          });
        }

        // Create PurchaseInvoiceItem
        await tx.purchaseInvoiceItem.create({
          data: {
            purchaseInvoiceId: purchaseInvoice.id,
            rawMaterialId: finalRawMaterialId,
            productId: finalProductId,
            supplierProductName: item.supplierProductName,
            description: item.description || null,
            hsn: item.hsnCode || null,
            quantity: item.quantity,
            unit: item.unit || 'pcs',
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            cgst: item.cgst || 0,
            sgst: item.sgst || 0,
            igst: item.igst || 0,
            lineTotal: item.lineTotal,
          },
        });

        // 4. Update Inventory — upsert InventoryItem
        if (finalRawMaterialId || finalProductId) {
          const existingInventory = await tx.inventoryItem.findFirst({
            where: {
              companyId,
              warehouseId,
              rawMaterialId: finalRawMaterialId || undefined,
              productId: finalProductId || undefined,
              deletedAt: null,
            },
          });

          if (existingInventory) {
            await tx.inventoryItem.update({
              where: { id: existingInventory.id },
              data: { quantity: { increment: item.quantity } },
            });
          } else {
            await tx.inventoryItem.create({
              data: {
                companyId,
                warehouseId,
                rawMaterialId: finalRawMaterialId || null,
                productId: finalProductId || null,
                quantity: item.quantity,
              },
            });
          }

          // 5. Create StockMovement record
          await tx.stockMovement.create({
            data: {
              companyId,
              destWarehouseId: warehouseId,
              rawMaterialId: finalRawMaterialId || null,
              productId: finalProductId || null,
              quantity: item.quantity,
              type: 'Receive',
              reference: invoiceNumber,
              notes: `Goods received via AI Invoice Processing — ${supplierName}`,
            },
          });

          processedItems.push(internalName);
        }
      }

      // 6. Create GoodsReceipt
      const goodsReceipt = await tx.goodsReceipt.create({
        data: {
          companyId,
          purchaseInvoiceId: purchaseInvoice.id,
          warehouseId,
          receivedAt: new Date(),
        },
      });

      // 7. Create Expense entry
      await tx.expense.create({
        data: {
          companyId,
          category: 'Raw Materials',
          amount: totalAmount,
          description: `Purchase Invoice ${invoiceNumber} — ${supplierName} | Items: ${processedItems.join(', ')}`,
          date: invoiceDate ? new Date(invoiceDate) : new Date(),
        },
      });

      // 8. Save AI Alias records (upsert to preserve usage counts)
      for (const alias of aliasesToSave) {
        await tx.invoiceAIAlias.upsert({
          where: { companyId_supplierProductName: { companyId, supplierProductName: alias.supplierName } },
          update: {
            internalName: alias.internalName,
            rawMaterialId: alias.rawMaterialId || null,
            productId: alias.productId || null,
            confidence: 1.0,
            usageCount: { increment: 1 },
            lastUsedAt: new Date(),
          },
          create: {
            companyId,
            supplierProductName: alias.supplierName,
            internalName: alias.internalName,
            rawMaterialId: alias.rawMaterialId || null,
            productId: alias.productId || null,
            confidence: 1.0,
            usageCount: 1,
          },
        });
      }

      // 9. Create Audit Log
      await tx.auditLog.create({
        data: {
          companyId,
          userId,
          action: 'Document Intelligence — Purchase Invoice Posted',
          entity: 'PurchaseInvoice',
          entityId: purchaseInvoice.id,
          details: JSON.stringify({
            invoiceNumber,
            supplierName,
            totalAmount,
            itemCount: items.filter(i => i.action !== 'ignore').length,
            warehouse: warehouse.name,
            aliasesSaved: aliasesToSave.length,
          }),
        },
      });

      // 10. Create Notification
      await tx.notification.create({
        data: {
          companyId,
          title: '📄 Invoice Posted Successfully',
          message: `Purchase invoice ${invoiceNumber} from ${supplierName} has been posted. ${processedItems.length} item(s) added to ${warehouse.name}.`,
          type: 'Info',
        },
      });

      return { purchaseInvoice, goodsReceipt, processedItems };
    }, { timeout: 60000 });

    return NextResponse.json({
      success: true,
      purchaseInvoiceId: result.purchaseInvoice.id,
      goodsReceiptId: result.goodsReceipt.id,
      itemsProcessed: result.processedItems.length,
      message: `Invoice ${invoiceNumber} posted successfully. ${result.processedItems.length} item(s) added to ${warehouse.name}.`,
    });
  } catch (error) {
    console.error('Document approve error:', error);
    return NextResponse.json({ error: 'Internal server error during approval' }, { status: 500 });
  }
}
