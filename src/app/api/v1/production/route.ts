import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, checkRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = session;

    // Fetch BOMs
    const boms = await db.billOfMaterials.findMany({
      where: { companyId, deletedAt: null },
      include: {
        product: true,
        items: {
          include: {
            rawMaterial: true,
          },
        },
      },
    });

    // Fetch Production Orders
    const productionOrders = await db.productionOrder.findMany({
      where: { companyId, deletedAt: null },
      include: {
        product: true,
        bom: true,
        machine: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ boms, productionOrders });
  } catch (error) {
    console.error('Production fetch failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = session;
    const body = await req.json();
    const { action } = body; // "createBOM" or "createOrder" or "updateStatus"

    if (action === 'createBOM') {
      if (!checkRole(session.role, ['Owner', 'Admin', 'Manager', 'Production'])) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const { productId, name, items } = body; // items: Array<{ rawMaterialId: string, quantity: number }>

      if (!productId || !name || !items || items.length === 0) {
        return NextResponse.json({ error: 'Missing product, name or components' }, { status: 400 });
      }

      // Verify product belongs to company
      const bomProduct = await db.product.findFirst({
        where: { id: productId, companyId, deletedAt: null },
      });
      if (!bomProduct) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      const bom = await db.$transaction(async (tx) => {
        const newBom = await tx.billOfMaterials.create({
          data: {
            companyId,
            productId,
            name,
          },
        });

        for (const item of items) {
          // Verify raw material belongs to company
          const rawMaterial = await tx.rawMaterial.findFirst({
            where: { id: item.rawMaterialId, companyId, deletedAt: null },
          });
          if (!rawMaterial) {
            throw new Error(`Raw material not found: ${item.rawMaterialId}`);
          }
          await tx.bOMItem.create({
            data: {
              bomId: newBom.id,
              rawMaterialId: item.rawMaterialId,
              quantity: parseFloat(item.quantity),
            },
          });
        }

        return newBom;
      });

      return NextResponse.json(bom, { status: 201 });
    }

    if (action === 'createOrder') {
      if (!checkRole(session.role, ['Owner', 'Admin', 'Manager', 'Production'])) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const { productId, bomId, machineId, quantity } = body;

      if (!productId || !bomId || !quantity) {
        return NextResponse.json({ error: 'Missing product, BOM recipe or batch quantity' }, { status: 400 });
      }

      const qtyVal = parseFloat(quantity);
      if (qtyVal <= 0) {
        return NextResponse.json({ error: 'Quantity must be positive' }, { status: 400 });
      }

      // Verify product belongs to company
      const orderProduct = await db.product.findFirst({
        where: { id: productId, companyId, deletedAt: null },
      });
      if (!orderProduct) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      // Verify BOM belongs to company
      const orderBom = await db.billOfMaterials.findFirst({
        where: { id: bomId, companyId, deletedAt: null },
      });
      if (!orderBom) {
        return NextResponse.json({ error: 'BOM not found' }, { status: 404 });
      }

      // Verify machine belongs to company (if provided)
      if (machineId) {
        const orderMachine = await db.machine.findFirst({
          where: { id: machineId, companyId, deletedAt: null },
        });
        if (!orderMachine) {
          return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
        }
      }

      // Check materials stock before allocating order
      const bomItems = await db.bOMItem.findMany({
        where: { bomId },
        include: { rawMaterial: true },
      });

      for (const item of bomItems) {
        const requiredQty = item.quantity * qtyVal;
        const inventory = await db.inventoryItem.findMany({
          where: { companyId, rawMaterialId: item.rawMaterialId, deletedAt: null },
        });
        const currentQty = inventory.reduce((acc, inv) => acc + inv.quantity, 0);

        if (currentQty < requiredQty) {
          return NextResponse.json({
            error: `Insufficient stock for component: ${item.rawMaterial.name}. Required: ${requiredQty} ${item.rawMaterial.unit}, Available: ${currentQty} ${item.rawMaterial.unit}`,
          }, { status: 400 });
        }
      }

      // Deduct materials and create order in a transaction
      const order = await db.$transaction(async (tx) => {
        // Find default warehouse
        const wh = await tx.warehouse.findFirst({
          where: { companyId, deletedAt: null },
        });
        const warehouseId = wh ? wh.id : '';

        let calculatedCost = 0;

        for (const item of bomItems) {
          const reqQty = item.quantity * qtyVal;
          calculatedCost += item.rawMaterial.cost * reqQty;

          // Deduct from warehouse inventory
          const invItem = await tx.inventoryItem.findFirst({
            where: { companyId, warehouseId, rawMaterialId: item.rawMaterialId, deletedAt: null },
          });

          if (invItem) {
            await tx.inventoryItem.update({
              where: { id: invItem.id },
              data: { quantity: invItem.quantity - reqQty },
            });
          }

          // Log stock movement
          await tx.stockMovement.create({
            data: {
              companyId,
              sourceWarehouseId: warehouseId,
              rawMaterialId: item.rawMaterialId,
              quantity: reqQty,
              type: 'Consumption',
              notes: `Allocated for Production Run`,
            },
          });
        }

        const newOrder = await tx.productionOrder.create({
          data: {
            companyId,
            productId,
            bomId,
            machineId: machineId || null,
            quantity: qtyVal,
            status: 'InProgress',
            cost: calculatedCost,
            startDate: new Date(),
          },
        });

        // Audit Log
        await tx.auditLog.create({
          data: {
            companyId,
            userId: session.userId,
            action: 'Create Production Order',
            entity: 'ProductionOrder',
            entityId: newOrder.id,
            details: `Started production order for product ${productId}, quantity ${qtyVal}`,
          },
        });

        return newOrder;
      });

      return NextResponse.json(order, { status: 201 });
    }

    if (action === 'updateStatus') {
      if (!checkRole(session.role, ['Owner', 'Admin', 'Manager', 'Production'])) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const { orderId, status } = body; // "Completed", "Cancelled"

      if (!orderId || !status) {
        return NextResponse.json({ error: 'Missing order details' }, { status: 400 });
      }

      // Verify the allowed status values
      const allowedStatuses = ['Completed', 'Cancelled'];
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }

      const order = await db.$transaction(async (tx) => {
        // Verify order belongs to company
        const existingOrder = await tx.productionOrder.findFirst({
          where: { id: orderId, companyId },
        });

        if (!existingOrder) throw new Error('Order not found');

        const updatedOrder = await tx.productionOrder.update({
          where: { id: orderId },
          data: {
            status,
            endDate: status === 'Completed' ? new Date() : null,
          },
        });

        if (status === 'Cancelled' && existingOrder.status === 'InProgress') {
          // Find default warehouse
          const wh = await tx.warehouse.findFirst({
            where: { companyId, deletedAt: null },
          });
          const warehouseId = wh ? wh.id : '';

          const bomItems = await tx.bOMItem.findMany({
            where: { bomId: existingOrder.bomId },
            include: { rawMaterial: true },
          });

          for (const item of bomItems) {
            const reqQty = item.quantity * existingOrder.quantity;

            // Add back to warehouse inventory
            const invItem = await tx.inventoryItem.findFirst({
              where: { companyId, warehouseId, rawMaterialId: item.rawMaterialId, deletedAt: null },
            });

            if (invItem) {
              await tx.inventoryItem.update({
                where: { id: invItem.id },
                data: { quantity: invItem.quantity + reqQty },
              });
            } else {
              await tx.inventoryItem.create({
                data: {
                  companyId,
                  warehouseId,
                  rawMaterialId: item.rawMaterialId,
                  quantity: reqQty,
                },
              });
            }

            // Log stock movement
            await tx.stockMovement.create({
              data: {
                companyId,
                destWarehouseId: warehouseId,
                rawMaterialId: item.rawMaterialId,
                quantity: reqQty,
                type: 'Receive',
                notes: `Restored from Cancelled Production Run (${existingOrder.id})`,
              },
            });
          }
        }

        if (status === 'Completed') {
          // Add finished goods to inventory!
          const wh = await tx.warehouse.findFirst({
            where: { companyId, deletedAt: null },
          });
          const warehouseId = wh ? wh.id : '';

          const invItem = await tx.inventoryItem.findFirst({
            where: { companyId, warehouseId, productId: existingOrder.productId, deletedAt: null },
          });

          if (invItem) {
            await tx.inventoryItem.update({
              where: { id: invItem.id },
              data: { quantity: invItem.quantity + existingOrder.quantity },
            });
          } else {
            await tx.inventoryItem.create({
              data: {
                companyId,
                warehouseId,
                productId: existingOrder.productId,
                quantity: existingOrder.quantity,
                batchNumber: `PRD-${Date.now().toString().slice(-6)}`,
              },
            });
          }

          // Stock movement
          await tx.stockMovement.create({
            data: {
              companyId,
              destWarehouseId: warehouseId,
              productId: existingOrder.productId,
              quantity: existingOrder.quantity,
              type: 'Receive',
              notes: `Production run yield`,
            },
          });
        }

        return updatedOrder;
      });

      return NextResponse.json(order);
    }

    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
  } catch (error) {
    console.error('Production execution error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
