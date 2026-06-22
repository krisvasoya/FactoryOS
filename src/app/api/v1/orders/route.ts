import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, checkRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [purchaseOrders, salesOrders] = await Promise.all([
      db.purchaseOrder.findMany({
        where: { companyId: session.companyId, deletedAt: null },
        include: {
          supplier: true,
          items: {
            where: { deletedAt: null },
            include: { rawMaterial: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.salesOrder.findMany({
        where: { companyId: session.companyId, deletedAt: null },
        include: {
          customer: true,
          items: {
            where: { deletedAt: null },
            include: { product: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ purchaseOrders, salesOrders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!checkRole(session.role, ['Owner', 'Admin', 'Manager', 'Sales'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // ─── Create Purchase Order ────────────────────────────────────
    if (action === 'createPurchaseOrder') {
      const { supplierId, notes, items } = body;
      if (!supplierId || !items?.length) {
        return NextResponse.json({ error: 'supplierId and items are required' }, { status: 400 });
      }

      const supplier = await db.supplier.findFirst({
        where: { id: supplierId, companyId: session.companyId, deletedAt: null },
      });
      if (!supplier) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });

      const poCount = await db.purchaseOrder.count({ where: { companyId: session.companyId } });
      const poNumber = `PO-${String(poCount + 1).padStart(4, '0')}`;

      let totalAmount = 0;
      for (const item of items) {
        totalAmount += (parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0);
      }

      const po = await db.purchaseOrder.create({
        data: {
          companyId: session.companyId,
          supplierId,
          poNumber,
          status: 'Draft',
          totalAmount,
          notes: notes || null,
          items: {
            create: items.map((item: { rawMaterialId: string; quantity: string | number; unitCost: string | number }) => ({
              rawMaterialId: item.rawMaterialId,
              quantity: parseFloat(String(item.quantity)) || 0,
              unitCost: parseFloat(String(item.unitCost)) || 0,
            })),
          },
        },
        include: { supplier: true, items: { include: { rawMaterial: true } } },
      });

      await db.auditLog.create({
        data: {
          companyId: session.companyId,
          userId: session.userId,
          action: 'Create PurchaseOrder',
          entity: 'PurchaseOrder',
          entityId: po.id,
          details: `Created PO ${poNumber} for supplier ${supplier.name}`,
        },
      });

      return NextResponse.json(po, { status: 201 });
    }

    // ─── Create Sales Order ───────────────────────────────────────
    if (action === 'createSalesOrder') {
      const { customerId, notes, items } = body;
      if (!customerId || !items?.length) {
        return NextResponse.json({ error: 'customerId and items are required' }, { status: 400 });
      }

      const customer = await db.customer.findFirst({
        where: { id: customerId, companyId: session.companyId, deletedAt: null },
      });
      if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

      const soCount = await db.salesOrder.count({ where: { companyId: session.companyId } });
      const soNumber = `SO-${String(soCount + 1).padStart(4, '0')}`;

      let totalAmount = 0;
      for (const item of items) {
        totalAmount += (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
      }

      const so = await db.salesOrder.create({
        data: {
          companyId: session.companyId,
          customerId,
          soNumber,
          status: 'Draft',
          totalAmount,
          notes: notes || null,
          items: {
            create: items.map((item: { productId: string; quantity: string | number; unitPrice: string | number }) => ({
              productId: item.productId,
              quantity: parseFloat(String(item.quantity)) || 0,
              unitPrice: parseFloat(String(item.unitPrice)) || 0,
            })),
          },
        },
        include: { customer: true, items: { include: { product: true } } },
      });

      await db.auditLog.create({
        data: {
          companyId: session.companyId,
          userId: session.userId,
          action: 'Create SalesOrder',
          entity: 'SalesOrder',
          entityId: so.id,
          details: `Created SO ${soNumber} for customer ${customer.name}`,
        },
      });

      return NextResponse.json(so, { status: 201 });
    }

    // ─── Update Order Status ──────────────────────────────────────
    if (action === 'updateOrderStatus') {
      const { orderId, orderType, status } = body;
      if (!orderId || !orderType || !status) {
        return NextResponse.json({ error: 'orderId, orderType and status are required' }, { status: 400 });
      }

      if (orderType === 'purchase') {
        const validStatuses = ['Draft', 'Ordered', 'Received', 'Cancelled'];
        if (!validStatuses.includes(status)) {
          return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }
        const po = await db.purchaseOrder.findFirst({
          where: { id: orderId, companyId: session.companyId, deletedAt: null },
          include: { items: { include: { rawMaterial: true } } },
        });
        if (!po) return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });

        await db.purchaseOrder.update({ where: { id: orderId }, data: { status } });

        // When received, add inventory
        if (status === 'Received') {
          const warehouse = await db.warehouse.findFirst({
            where: { companyId: session.companyId, deletedAt: null },
          });
          if (warehouse) {
            for (const item of po.items) {
              const existing = await db.inventoryItem.findFirst({
                where: {
                  companyId: session.companyId,
                  warehouseId: warehouse.id,
                  rawMaterialId: item.rawMaterialId,
                  deletedAt: null,
                },
              });
              if (existing) {
                await db.inventoryItem.update({
                  where: { id: existing.id },
                  data: { quantity: existing.quantity + item.quantity },
                });
              } else {
                await db.inventoryItem.create({
                  data: {
                    companyId: session.companyId,
                    warehouseId: warehouse.id,
                    rawMaterialId: item.rawMaterialId,
                    quantity: item.quantity,
                  },
                });
              }
            }
          }
        }

        return NextResponse.json({ success: true });
      }

      if (orderType === 'sales') {
        const validStatuses = ['Draft', 'Confirmed', 'Shipped', 'Cancelled'];
        if (!validStatuses.includes(status)) {
          return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }
        await db.salesOrder.updateMany({
          where: { id: orderId, companyId: session.companyId },
          data: { status },
        });
        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ error: 'Invalid orderType' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
