import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

interface InvoiceItem {
  productName: string;
  hsnCode?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  _aliasMatch?: {
    internalName: string;
    rawMaterialId?: string;
    productId?: string;
    confidence: number;
  } | null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = session;
    const body = await req.json();
    const { items } = body as { items: InvoiceItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required for matching' }, { status: 400 });
    }

    // Fetch all raw materials and products for this company
    const [rawMaterials, products, warehouses] = await Promise.all([
      db.rawMaterial.findMany({
        where: { companyId, deletedAt: null },
        select: { id: true, name: true, sku: true, unit: true, cost: true },
      }),
      db.product.findMany({
        where: { companyId, deletedAt: null },
        select: { id: true, name: true, sku: true, unit: true, cost: true },
      }),
      db.warehouse.findMany({
        where: { companyId, deletedAt: null },
        select: { id: true, name: true },
      }),
    ]);

    const geminiKey = process.env.GEMINI_API_KEY;

    // Items that have alias pre-match (from extract step) — skip Gemini for these
    const aliasMatched: Record<number, { matchType: 'alias'; matchedId: string; matchedType: 'rawMaterial' | 'product'; matchedName: string; confidence: number }> = {};
    const itemsToMatch: { index: number; item: InvoiceItem }[] = [];

    items.forEach((item, index) => {
      if (item._aliasMatch?.rawMaterialId || item._aliasMatch?.productId) {
        const alias = item._aliasMatch;
        const matchedId = (alias.rawMaterialId || alias.productId)!;
        const matchedType = alias.rawMaterialId ? 'rawMaterial' : 'product';
        const matchedEntity = matchedType === 'rawMaterial'
          ? rawMaterials.find(r => r.id === matchedId)
          : products.find(p => p.id === matchedId);

        if (matchedEntity) {
          aliasMatched[index] = {
            matchType: 'alias',
            matchedId,
            matchedType,
            matchedName: matchedEntity.name,
            confidence: alias.confidence,
          };
          return;
        }
      }
      itemsToMatch.push({ index, item });
    });

    let geminiMatchResults: Record<number, {
      matchType: 'exact' | 'fuzzy' | 'new';
      matchedId?: string;
      matchedType?: 'rawMaterial' | 'product';
      matchedName?: string;
      confidence: number;
      alternatives?: Array<{ id: string; name: string; type: 'rawMaterial' | 'product'; confidence: number }>;
    }> = {};

    if (itemsToMatch.length > 0 && geminiKey) {
      const dbCatalog = [
        ...rawMaterials.map(r => ({ id: r.id, name: r.name, sku: r.sku, type: 'rawMaterial' })),
        ...products.map(p => ({ id: p.id, name: p.name, sku: p.sku, type: 'product' })),
      ];

      const matchPrompt = `You are an AI product matching engine for a manufacturing ERP.

DATABASE CATALOG (JSON):
${JSON.stringify(dbCatalog, null, 2)}

INVOICE ITEMS TO MATCH (JSON):
${JSON.stringify(itemsToMatch.map(({ index, item }) => ({ index, name: item.productName, hsn: item.hsnCode })), null, 2)}

For each invoice item, find the best match from the DATABASE CATALOG using fuzzy matching logic:
- Consider abbreviations (MS = Mild Steel, SS = Stainless Steel)
- Handle measurement variants (2" = 2 Inch, 2IN)
- Ignore punctuation differences
- Consider HSN code as strong signal if available
- Consider SKU if visible

Return ONLY a JSON object (no markdown) where key is the invoice item's "index" number, value is:
{
  "matchType": "exact" | "fuzzy" | "new",
  "matchedId": "database-id or null",
  "matchedType": "rawMaterial" | "product" | null,
  "matchedName": "matching product name or null",
  "confidence": 0.0-1.0,
  "alternatives": [
    { "id": "...", "name": "...", "type": "rawMaterial|product", "confidence": 0.85 }
  ]
}

Rules:
- "exact": confidence >= 0.95 (very confident, auto-map)
- "fuzzy": confidence 0.6-0.94 (plausible, needs user confirmation)
- "new": confidence < 0.6 (not found, needs user to create or map)
- Always include top 3 alternatives ordered by confidence descending
- If catalog is empty, all items are "new"`;

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: matchPrompt }] }],
              generationConfig: { maxOutputTokens: 2048, temperature: 0.1 },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const raw = (data.candidates?.[0]?.content?.parts?.[0]?.text || '{}')
            .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
          geminiMatchResults = JSON.parse(raw);
        }
      } catch (err) {
        console.error('Gemini match error:', err);
        // Fall back: mark all as "new"
        itemsToMatch.forEach(({ index }) => {
          geminiMatchResults[index] = { matchType: 'new', confidence: 0 };
        });
      }
    } else if (itemsToMatch.length > 0) {
      // No Gemini key — do simple exact name match
      itemsToMatch.forEach(({ index, item }) => {
        const nameLower = item.productName.toLowerCase();
        const rmMatch = rawMaterials.find(r => r.name.toLowerCase() === nameLower);
        const prMatch = products.find(p => p.name.toLowerCase() === nameLower);
        if (rmMatch) {
          geminiMatchResults[index] = { matchType: 'exact', matchedId: rmMatch.id, matchedType: 'rawMaterial', matchedName: rmMatch.name, confidence: 1.0 };
        } else if (prMatch) {
          geminiMatchResults[index] = { matchType: 'exact', matchedId: prMatch.id, matchedType: 'product', matchedName: prMatch.name, confidence: 1.0 };
        } else {
          geminiMatchResults[index] = { matchType: 'new', confidence: 0 };
        }
      });
    }

    // Merge all match results
    const finalMatches = items.map((item, index) => {
      if (aliasMatched[index]) {
        return { ...item, match: aliasMatched[index] };
      }
      const geminiMatch = geminiMatchResults[index] || { matchType: 'new', confidence: 0 };
      return { ...item, match: geminiMatch };
    });

    return NextResponse.json({
      success: true,
      matches: finalMatches,
      warehouses,
      summary: {
        total: items.length,
        autoMapped: finalMatches.filter(m => ['exact', 'alias'].includes(m.match?.matchType)).length,
        needsConfirmation: finalMatches.filter(m => m.match?.matchType === 'fuzzy').length,
        notFound: finalMatches.filter(m => m.match?.matchType === 'new').length,
      },
    });
  } catch (error) {
    console.error('Document match error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
