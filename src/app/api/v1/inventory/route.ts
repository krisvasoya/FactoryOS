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

    // Fetch Warehouses
    const warehouses = await db.warehouse.findMany({
      where: { companyId, deletedAt: null },
    });

    // Fetch Inventory Levels
    const inventoryItems = await db.inventoryItem.findMany({
      where: { companyId, deletedAt: null },
      include: {
        warehouse: true,
        product: true,
        rawMaterial: true,
      },
    });

    // Fetch Stock Movements
    const movements = await db.stockMovement.findMany({
      where: { companyId, deletedAt: null },
      include: {
        sourceWarehouse: true,
        destWarehouse: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      warehouses,
      inventoryItems,
      movements,
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!checkRole(session.role, ['Owner', 'Admin', 'Manager', 'Warehouse'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { companyId } = session;
    const body = await req.json();
    const {
      warehouseId,
      productId,
      rawMaterialId,
      quantity,
      type, // Receive, Issue, Transfer, Adjustment
      destWarehouseId,
      batchNumber,
      notes,
    } = body;

    if (!warehouseId || (!productId && !rawMaterialId) || quantity === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const qtyVal = parseFloat(quantity);
    if (isNaN(qtyVal) || qtyVal <= 0) {
      return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 });
    }

    // Verify source warehouse belongs to company
    const warehouse = await db.warehouse.findFirst({
      where: { id: warehouseId, companyId, deletedAt: null }
    });
    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    // Verify destination warehouse belongs to company if it is a Transfer operation
    if (type === 'Transfer') {
      if (!destWarehouseId) {
        return NextResponse.json({ error: 'Destination warehouse is required for transfer.' }, { status: 400 });
      }
      const destWarehouse = await db.warehouse.findFirst({
        where: { id: destWarehouseId, companyId, deletedAt: null }
      });
      if (!destWarehouse) {
        return NextResponse.json({ error: 'Destination warehouse not found' }, { status: 404 });
      }
    }

    // Verify product belongs to company if provided
    if (productId) {
      const product = await db.product.findFirst({
        where: { id: productId, companyId, deletedAt: null }
      });
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
    }

    // Verify raw material belongs to company if provided
    if (rawMaterialId) {
      const rawMaterial = await db.rawMaterial.findFirst({
        where: { id: rawMaterialId, companyId, deletedAt: null }
      });
      if (!rawMaterial) {
        return NextResponse.json({ error: 'Raw material not found' }, { status: 404 });
      }
    }

    // Execute within a prisma transaction to ensure consistency
    const result = await db.$transaction(async (tx) => {
      // 1. Log Stock Movement
      const movement = await tx.stockMovement.create({
        data: {
          companyId,
          sourceWarehouseId: type === 'Transfer' || type === 'Issue' ? warehouseId : null,
          destWarehouseId: type === 'Transfer' || type === 'Receive' ? (type === 'Transfer' ? destWarehouseId : warehouseId) : null,
          productId: productId || null,
          rawMaterialId: rawMaterialId || null,
          quantity: qtyVal,
          type,
          reference: batchNumber ? `BATCH: ${batchNumber}` : 'MANUAL_ADJ',
          notes,
        },
      });

      // Helper: Modify stock level at target warehouse
      const updateStock = async (whId: string, delta: number) => {
        const existing = await tx.inventoryItem.findFirst({
          where: {
            companyId,
            warehouseId: whId,
            productId: productId || null,
            rawMaterialId: rawMaterialId || null,
            deletedAt: null,
          },
        });

        if (existing) {
          const newQty = existing.quantity + delta;
          if (newQty < 0) {
            throw new Error(`Insufficient stock in warehouse for transaction.`);
          }
          return tx.inventoryItem.update({
            where: { id: existing.id },
            data: {
              quantity: newQty,
              batchNumber: batchNumber || existing.batchNumber,
            },
          });
        } else {
          if (delta < 0) {
            throw new Error(`Insufficient stock. Warehouse contains zero entries.`);
          }
          return tx.inventoryItem.create({
            data: {
              companyId,
              warehouseId: whId,
              productId: productId || null,
              rawMaterialId: rawMaterialId || null,
              quantity: delta,
              batchNumber,
            },
          });
        }
      };

      if (type === 'Receive' || type === 'Adjustment') {
        // Increase stock
        await updateStock(warehouseId, qtyVal);
      } else if (type === 'Issue') {
        // Decrease stock
        await updateStock(warehouseId, -qtyVal);
      } else if (type === 'Transfer') {
        if (!destWarehouseId) {
          throw new Error('Destination warehouse is required for transfer.');
        }
        // Deduct from source, add to destination
        await updateStock(warehouseId, -qtyVal);
        await updateStock(destWarehouseId, qtyVal);
      }

      // Log action in audit table
      await tx.auditLog.create({
        data: {
          companyId,
          userId: session.userId,
          action: 'Adjust Stock',
          entity: 'InventoryItem',
          details: `Stock adjustment: ${type} ${qtyVal} units for ${productId ? 'Product' : 'Material'}`,
        },
      });

      return movement;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Inventory adjustment failed:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
