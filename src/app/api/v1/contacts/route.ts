import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, checkRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [suppliers, customers] = await Promise.all([
      db.supplier.findMany({
        where: { companyId: session.companyId, deletedAt: null },
        include: { purchaseOrders: { where: { deletedAt: null } } },
        orderBy: { createdAt: 'desc' },
      }),
      db.customer.findMany({
        where: { companyId: session.companyId, deletedAt: null },
        include: { salesOrders: { where: { deletedAt: null } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ suppliers, customers });
  } catch (error) {
    console.error('Contacts fetch error:', error);
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
    const { type, name, contactName, email, phone, address, creditLimit, rating } = body;

    if (!type || !name) {
      return NextResponse.json({ error: 'type and name are required' }, { status: 400 });
    }

    if (type === 'supplier') {
      const supplier = await db.supplier.create({
        data: {
          companyId: session.companyId,
          name: name.trim(),
          contactName: contactName || null,
          email: email || null,
          phone: phone || null,
          address: address || null,
          rating: parseFloat(rating) || 5.0,
        },
      });
      await db.auditLog.create({
        data: {
          companyId: session.companyId,
          userId: session.userId,
          action: 'Create Supplier',
          entity: 'Supplier',
          entityId: supplier.id,
          details: `Created supplier: ${name}`,
        },
      });
      return NextResponse.json(supplier, { status: 201 });
    }

    if (type === 'customer') {
      const customer = await db.customer.create({
        data: {
          companyId: session.companyId,
          name: name.trim(),
          contactName: contactName || null,
          email: email || null,
          phone: phone || null,
          address: address || null,
          creditLimit: parseFloat(creditLimit) || 0.0,
        },
      });
      await db.auditLog.create({
        data: {
          companyId: session.companyId,
          userId: session.userId,
          action: 'Create Customer',
          entity: 'Customer',
          entityId: customer.id,
          details: `Created customer: ${name}`,
        },
      });
      return NextResponse.json(customer, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid type. Must be supplier or customer.' }, { status: 400 });
  } catch (error) {
    console.error('Contact create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
