import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawMaterials = await db.rawMaterial.findMany({
      where: {
        companyId: session.companyId,
        deletedAt: null,
      },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rawMaterials);
  } catch (error) {
    console.error('Raw materials fetch error:', error);
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
    const { name, sku, description, cost, unit, minStock, categoryId } = body;

    if (!name || !sku) {
      return NextResponse.json({ error: 'Name and SKU are required' }, { status: 400 });
    }

    // Check SKU duplicate
    const existingMaterial = await db.rawMaterial.findFirst({
      where: {
        companyId: session.companyId,
        sku: sku.trim(),
        deletedAt: null,
      },
    });

    if (existingMaterial) {
      return NextResponse.json({ error: 'Material SKU already exists' }, { status: 400 });
    }

    // Verify category belongs to company (if provided)
    if (categoryId) {
      const category = await db.category.findFirst({
        where: { id: categoryId, companyId: session.companyId, deletedAt: null },
      });
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
    }

    const costVal = parseFloat(cost) || 0.0;
    const minStockVal = parseFloat(minStock) || 0.0;

    if (costVal < 0) {
      return NextResponse.json({ error: 'Cost must be zero or positive' }, { status: 400 });
    }
    if (minStockVal < 0) {
      return NextResponse.json({ error: 'Minimum stock level must be zero or positive' }, { status: 400 });
    }

    const material = await db.rawMaterial.create({
      data: {
        companyId: session.companyId,
        categoryId: categoryId || null,
        sku: sku.trim(),
        name: name.trim(),
        description: description || null,
        cost: costVal,
        unit: unit || 'kg',
        minStock: minStockVal,
      },
    });

    // Audit Log
    await db.auditLog.create({
      data: {
        companyId: session.companyId,
        userId: session.userId,
        action: 'Create Raw Material',
        entity: 'RawMaterial',
        entityId: material.id,
        details: `Created raw material SKU: ${sku}, Name: ${name}`,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Raw material create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
