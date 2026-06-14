import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

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
      const { productId, name, items } = body; // items: Array<{ rawMaterialId: string, quantity: number }>

      if (!productId || !name || !items || items.length === 0) {
        return NextResponse.json({ error: 'Missing product, name or components' }, { status: 400 });
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
      const { productId, bomId, machineId, quantity } = body;

      if (!productId || !bomId || !quantity) {
        return NextResponse.json({ error: 'Missing product, BOM recipe or batch quantity' }, { status: 400 });
      }

      const qtyVal = parseFloat(quantity);
      if (qtyVal <= 0) {
        return NextResponse.json({ error: 'Quantity must be positive' }, { status: 400 });
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
      const { orderId, status } = body; // "Completed", "Cancelled"

      if (!orderId || !status) {
        return NextResponse.json({ error: 'Missing order details' }, { status: 400 });
      }

      const order = await db.$transaction(async (tx) => {
        const existingOrder = await tx.productionOrder.findUnique({
          where: { id: orderId },
        });

        if (!existingOrder) throw new Error('Order not found');

        const updatedOrder = await tx.productionOrder.update({
          where: { id: orderId },
          data: {
            status,
            endDate: status === 'Completed' ? new Date() : null,
          },
        });

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
  } catch (error: any) {
    console.error('Production execution error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
