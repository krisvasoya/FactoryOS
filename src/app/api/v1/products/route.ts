import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await db.product.findMany({
      where: {
        companyId: session.companyId,
        deletedAt: null,
      },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, sku, description, price, cost, unit, type, categoryId } = body;

    if (!name || !sku) {
      return NextResponse.json({ error: 'Name and SKU are required' }, { status: 400 });
    }

    // Check SKU duplicate
    const existingProduct = await db.product.findFirst({
      where: {
        companyId: session.companyId,
        sku: sku.trim(),
        deletedAt: null,
      },
    });

    if (existingProduct) {
      return NextResponse.json({ error: 'Product SKU already exists' }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        companyId: session.companyId,
        categoryId: categoryId || null,
        sku: sku.trim(),
        name: name.trim(),
        description: description || null,
        price: parseFloat(price) || 0.0,
        cost: parseFloat(cost) || 0.0,
        unit: unit || 'pcs',
        type: type || 'Finished',
      },
    });

    // Audit Log
    await db.auditLog.create({
      data: {
        companyId: session.companyId,
        userId: session.userId,
        action: 'Create Product',
        entity: 'Product',
        entityId: product.id,
        details: `Created product SKU: ${sku}, Name: ${name}`,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
