'use client';

import { useState, useCallback } from 'react';

export type Phase = 'upload' | 'processing' | 'review' | 'success';
export type ProcessingStep = 'idle' | 'uploading' | 'extracting' | 'matching' | 'done' | 'error';

export interface ExtractedItem {
  srNo?: number;
  productName: string;
  description?: string;
  hsnCode?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  taxAmount?: number;
  lineTotal: number;
  _aliasMatch?: {
    internalName: string;
    rawMaterialId?: string;
    productId?: string;
    confidence: number;
  } | null;
}

export interface MatchResult {
  matchType: 'exact' | 'fuzzy' | 'alias' | 'new';
  matchedId?: string;
  matchedType?: 'rawMaterial' | 'product';
  matchedName?: string;
  confidence: number;
  alternatives?: Array<{ id: string; name: string; type: 'rawMaterial' | 'product'; confidence: number }>;
}

export interface MatchedItem extends ExtractedItem {
  match: MatchResult;
  // User decision fields
  userAction?: 'map' | 'create' | 'ignore' | 'auto';
  userMappedId?: string;
  userMappedType?: 'rawMaterial' | 'product';
  userMappedName?: string;
  newProductData?: {
    name: string;
    sku: string;
    unit: string;
    categoryId?: string;
    type: 'rawMaterial' | 'product';
    minStock?: number;
  };
}

export interface ExtractedInvoice {
  supplier: {
    name: string;
    gstNumber?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  invoice: {
    invoiceNumber: string;
    invoiceDate?: string;
    poNumber?: string;
    paymentTerms?: string;
  };
  items: ExtractedItem[];
  financials: {
    subtotal: number;
    totalDiscount: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
    freight: number;
    packingCharges: number;
    roundOff: number;
    grandTotal: number;
  };
  confidence: {
    supplier: number;
    invoiceNumber: number;
    itemsExtraction: number;
    financialTotals: number;
  };
  flags: {
    potentialDuplicate: boolean;
    calculationMismatch: boolean;
    missingFields: string[];
    warnings: string[];
  };
}

export interface Warehouse {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export function useDocumentIntelligence() {
  const [phase, setPhase] = useState<Phase>('upload');
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [processingMessage, setProcessingMessage] = useState('');
  const [error, setError] = useState('');

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedInvoice, setExtractedInvoice] = useState<ExtractedInvoice | null>(null);
  const [matchedItems, setMatchedItems] = useState<MatchedItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<{ isDuplicate: boolean; message: string } | null>(null);

  // Wizard state
  const [wizardItemIndex, setWizardItemIndex] = useState<number | null>(null);
  const [matchSelectorIndex, setMatchSelectorIndex] = useState<number | null>(null);

  const [isApproving, setIsApproving] = useState(false);
  const [successData, setSuccessData] = useState<{ invoiceNumber: string; itemsProcessed: number } | null>(null);

  const processFile = useCallback(async (file: File) => {
    setError('');
    setPhase('processing');
    setProcessingStep('uploading');
    setProcessingMessage('Reading document...');

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix (e.g. "data:image/jpeg;base64,")
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setProcessingStep('extracting');
      setProcessingMessage('Gemini Vision AI is reading your invoice...');

      // Step 1: Extract
      const extractRes = await fetch('/api/v1/documents/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64,
          mimeType: file.type || 'image/jpeg',
          fileName: file.name,
        }),
      });

      if (!extractRes.ok) {
        const err = await extractRes.json();
        throw new Error(err.error || 'Extraction failed');
      }

      const extractData = await extractRes.json();
      const invoice = extractData.extracted as ExtractedInvoice;
      setExtractedInvoice(invoice);

      if (extractData.duplicateWarning) {
        setDuplicateWarning(extractData.duplicateWarning);
      }

      setProcessingStep('matching');
      setProcessingMessage('Searching inventory database for product matches...');

      // Step 2: Match
      const matchRes = await fetch('/api/v1/documents/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: invoice.items }),
      });

      if (!matchRes.ok) {
        const err = await matchRes.json();
        throw new Error(err.error || 'Matching failed');
      }

      const matchData = await matchRes.json();
      setWarehouses(matchData.warehouses || []);
      if (matchData.warehouses?.length > 0) {
        setSelectedWarehouseId(matchData.warehouses[0].id);
      }

      // Build matched items — auto-set userAction for high-confidence matches
      const matched: MatchedItem[] = matchData.matches.map((m: MatchedItem) => {
        const autoAction = ['exact', 'alias'].includes(m.match?.matchType) ? 'auto' : undefined;
        return { ...m, userAction: autoAction };
      });

      setMatchedItems(matched);
      setProcessingStep('done');
      setProcessingMessage('Analysis complete!');

      setTimeout(() => setPhase('review'), 600);
    } catch (err) {
      setProcessingStep('error');
      setError(err instanceof Error ? err.message : 'Processing failed');
      setPhase('upload');
    }
  }, []);

  const updateItemDecision = useCallback((index: number, updates: Partial<MatchedItem>) => {
    setMatchedItems(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  }, []);

  const openWizard = useCallback((index: number) => setWizardItemIndex(index), []);
  const closeWizard = useCallback(() => setWizardItemIndex(null), []);

  const confirmNewProduct = useCallback((index: number, newProductData: MatchedItem['newProductData']) => {
    setMatchedItems(prev => prev.map((item, i) =>
      i === index ? { ...item, userAction: 'create', newProductData } : item
    ));
    setWizardItemIndex(null);
  }, []);

  const openMatchSelector = useCallback((index: number) => setMatchSelectorIndex(index), []);
  const closeMatchSelector = useCallback(() => setMatchSelectorIndex(null), []);

  const confirmMatchSelection = useCallback((index: number, selected: { id: string; name: string; type: 'rawMaterial' | 'product' }) => {
    setMatchedItems(prev => prev.map((item, i) =>
      i === index ? {
        ...item,
        userAction: 'map',
        userMappedId: selected.id,
        userMappedType: selected.type,
        userMappedName: selected.name,
      } : item
    ));
    setMatchSelectorIndex(null);
  }, []);

  const pendingDecisions = matchedItems.filter(
    m => !m.userAction && m.match?.matchType === 'fuzzy'
  ).length;

  const unresolvedNew = matchedItems.filter(
    m => !m.userAction && m.match?.matchType === 'new'
  ).length;

  const canApprove = pendingDecisions === 0 && unresolvedNew === 0 && selectedWarehouseId;

  const handleApprove = useCallback(async () => {
    if (!extractedInvoice || !canApprove) return;
    setIsApproving(true);
    setError('');

    try {
      const payload = {
        supplierName: extractedInvoice.supplier.name,
        supplierGst: extractedInvoice.supplier.gstNumber,
        invoiceNumber: extractedInvoice.invoice.invoiceNumber,
        invoiceDate: extractedInvoice.invoice.invoiceDate,
        poNumber: extractedInvoice.invoice.poNumber,
        subtotal: extractedInvoice.financials.subtotal,
        cgst: extractedInvoice.financials.cgst,
        sgst: extractedInvoice.financials.sgst,
        igst: extractedInvoice.financials.igst,
        freight: extractedInvoice.financials.freight,
        packingCharges: extractedInvoice.financials.packingCharges,
        roundOff: extractedInvoice.financials.roundOff,
        totalAmount: extractedInvoice.financials.grandTotal,
        warehouseId: selectedWarehouseId,
        items: matchedItems.map(item => ({
          supplierProductName: item.productName,
          description: item.description,
          hsnCode: item.hsnCode,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          cgst: item.cgst || 0,
          sgst: item.sgst || 0,
          igst: item.igst || 0,
          lineTotal: item.lineTotal,
          action: item.userAction === 'auto' ? 'map' : (item.userAction || 'ignore'),
          rawMaterialId: item.userAction === 'auto' && item.match?.matchedType === 'rawMaterial'
            ? item.match.matchedId
            : item.userMappedType === 'rawMaterial' ? item.userMappedId : undefined,
          productId: item.userAction === 'auto' && item.match?.matchedType === 'product'
            ? item.match.matchedId
            : item.userMappedType === 'product' ? item.userMappedId : undefined,
          newProduct: item.newProductData,
        })),
      };

      const res = await fetch('/api/v1/documents/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Approval failed');
      }

      const data = await res.json();
      setSuccessData({
        invoiceNumber: extractedInvoice.invoice.invoiceNumber,
        itemsProcessed: data.itemsProcessed,
      });
      setPhase('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setIsApproving(false);
    }
  }, [extractedInvoice, matchedItems, selectedWarehouseId, canApprove]);

  const reset = useCallback(() => {
    setPhase('upload');
    setProcessingStep('idle');
    setProcessingMessage('');
    setError('');
    setUploadedFile(null);
    setExtractedInvoice(null);
    setMatchedItems([]);
    setDuplicateWarning(null);
    setSuccessData(null);
    setWizardItemIndex(null);
    setMatchSelectorIndex(null);
  }, []);

  return {
    phase, processingStep, processingMessage, error,
    uploadedFile, setUploadedFile,
    extractedInvoice, matchedItems,
    warehouses, selectedWarehouseId, setSelectedWarehouseId,
    duplicateWarning,
    wizardItemIndex, matchSelectorIndex,
    pendingDecisions, unresolvedNew, canApprove,
    isApproving, successData,
    processFile, updateItemDecision,
    openWizard, closeWizard, confirmNewProduct,
    openMatchSelector, closeMatchSelector, confirmMatchSelection,
    handleApprove, reset,
  };
}
