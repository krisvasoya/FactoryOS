import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const EXTRACTION_PROMPT = `You are an expert OCR engine for manufacturing ERP systems. Analyze this supplier invoice document and extract ALL data into a strict JSON format.

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "supplier": {
    "name": "...",
    "gstNumber": "...",
    "address": "...",
    "phone": "...",
    "email": "..."
  },
  "invoice": {
    "invoiceNumber": "...",
    "invoiceDate": "YYYY-MM-DD or null",
    "poNumber": "... or null",
    "paymentTerms": "... or null"
  },
  "items": [
    {
      "srNo": 1,
      "productName": "...",
      "description": "... or null",
      "hsnCode": "... or null",
      "quantity": 0,
      "unit": "pcs/kg/m/ltr/box/set",
      "unitPrice": 0,
      "discount": 0,
      "cgst": 0,
      "sgst": 0,
      "igst": 0,
      "taxAmount": 0,
      "lineTotal": 0
    }
  ],
  "financials": {
    "subtotal": 0,
    "totalDiscount": 0,
    "cgst": 0,
    "sgst": 0,
    "igst": 0,
    "totalTax": 0,
    "freight": 0,
    "packingCharges": 0,
    "roundOff": 0,
    "grandTotal": 0
  },
  "confidence": {
    "supplier": 0.95,
    "invoiceNumber": 0.99,
    "itemsExtraction": 0.90,
    "financialTotals": 0.98
  },
  "flags": {
    "potentialDuplicate": false,
    "calculationMismatch": false,
    "missingFields": [],
    "warnings": []
  }
}

Rules:
- All numeric values must be numbers, not strings
- If a field is not found, use null for strings and 0 for numbers
- Dates must be in YYYY-MM-DD format
- Calculate and verify if grandTotal = subtotal - discount + totalTax + freight + packingCharges + roundOff
- Set calculationMismatch=true if totals don't match within ₹1
- Extract ALL line items, even if the table spans multiple pages
- For HSN codes, extract the 4-8 digit code only`;

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = session;
    const body = await req.json();
    const { fileBase64, mimeType, fileName } = body;

    if (!fileBase64 || !mimeType) {
      return NextResponse.json({ error: 'File data is required' }, { status: 400 });
    }

    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimes.includes(mimeType)) {
      return NextResponse.json({ error: 'Unsupported file type. Use PDF, JPG, or PNG.' }, { status: 400 });
    }

    // Check file size (base64 is ~33% larger than original, limit to ~10MB base64 = ~7.5MB file)
    if (fileBase64.length > 14_000_000) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json({ error: 'AI service not configured. Set GEMINI_API_KEY in .env' }, { status: 503 });
    }

    // Call Gemini Vision API
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: fileBase64,
                  },
                },
                { text: EXTRACTION_PROMPT },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 4096,
            temperature: 0.1, // low temperature for accurate extraction
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini Vision API error:', errText);
      return NextResponse.json({ error: 'AI extraction failed. Please try again.' }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean the response — remove any markdown code blocks if Gemini added them
    const cleanedText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let extracted: Record<string, unknown>;
    try {
      extracted = JSON.parse(cleanedText);
    } catch {
      console.error('Failed to parse Gemini JSON response:', cleanedText.substring(0, 500));
      return NextResponse.json({ error: 'AI could not parse the document structure. Please ensure the invoice is clear and readable.' }, { status: 422 });
    }

    // Check for duplicate invoice number
    const invoiceNumber = (extracted.invoice as Record<string, string>)?.invoiceNumber;
    let isDuplicate = false;
    let duplicateId: string | null = null;

    if (invoiceNumber) {
      const existing = await db.purchaseInvoice.findFirst({
        where: { companyId, invoiceNumber, deletedAt: null },
      });
      if (existing) {
        isDuplicate = true;
        duplicateId = existing.id;
      }
    }

    // Load saved AI aliases for this company to pre-map items
    const aliases = await db.invoiceAIAlias.findMany({
      where: { companyId },
    });

    const aliasMap = new Map(aliases.map((a) => [a.supplierProductName.toLowerCase(), a]));

    // Annotate items with alias pre-matches
    const items = ((extracted.items as unknown[]) || []) as Record<string, unknown>[];
    const annotatedItems = items.map((item) => {
      const productName = (item.productName as string) || '';
      const alias = aliasMap.get(productName.toLowerCase());
      return {
        ...item,
        _aliasMatch: alias
          ? {
              internalName: alias.internalName,
              rawMaterialId: alias.rawMaterialId,
              productId: alias.productId,
              confidence: alias.confidence,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      fileName: fileName || 'invoice',
      extracted: {
        ...extracted,
        items: annotatedItems,
      },
      duplicateWarning: isDuplicate
        ? { isDuplicate: true, existingId: duplicateId, message: `⚠️ Invoice number "${invoiceNumber}" was already posted on a previous date.` }
        : null,
    });
  } catch (error) {
    console.error('Document extract error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
