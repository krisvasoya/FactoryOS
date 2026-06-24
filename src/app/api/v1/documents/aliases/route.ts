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

    const aliases = await db.invoiceAIAlias.findMany({
      where: { companyId },
      orderBy: { lastUsedAt: 'desc' },
      include: {
        rawMaterial: {
          select: { name: true, sku: true },
        },
        product: {
          select: { name: true, sku: true },
        },
      },
    });

    return NextResponse.json(aliases);
  } catch (error) {
    console.error('Fetch aliases error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
