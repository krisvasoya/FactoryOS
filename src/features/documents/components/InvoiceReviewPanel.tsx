'use client';

import React from 'react';
import {
  AlertTriangle,
  Building,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Truck,
  Database,
  PlusCircle,
  Trash2,
  Undo2,
  Sparkles,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  useDocumentIntelligence,
} from '../hooks/useDocumentIntelligence';
import { NewProductWizard } from './NewProductWizard';
import { ProductMatchSelector } from './ProductMatchSelector';

interface InvoiceReviewPanelProps {
  hookData: ReturnType<typeof useDocumentIntelligence>;
}

export function InvoiceReviewPanel({ hookData }: InvoiceReviewPanelProps) {
  const {
    extractedInvoice,
    matchedItems,
    warehouses,
    selectedWarehouseId,
    setSelectedWarehouseId,
    duplicateWarning,
    wizardItemIndex,
    matchSelectorIndex,
    pendingDecisions,
    unresolvedNew,
    canApprove,
    isApproving,
    error,
    updateItemDecision,
    openWizard,
    closeWizard,
    confirmNewProduct,
    openMatchSelector,
    closeMatchSelector,
    confirmMatchSelection,
    handleApprove,
    reset,
  } = hookData;

  if (!extractedInvoice) return null;

  const { supplier, invoice, financials, confidence, flags } = extractedInvoice;

  // Helper to determine badge color for confidence scores
  const getConfColor = (score: number) => {
    if (score >= 0.9) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 0.75) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="w-full space-y-6 animate-fade-in text-xs pb-12">
      {/* Notifications/Warnings */}
      {duplicateWarning && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Potential Duplicate Invoice Found</p>
            <p className="text-[11px] text-amber-400/80 mt-0.5">{duplicateWarning.message}</p>
          </div>
        </div>
      )}

      {flags.calculationMismatch && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Financial Calculation Discrepancy</p>
            <p className="text-[11px] text-red-400/80 mt-0.5">
              The grand total extracted from the invoice does not match the sum of line items + taxes + freight. Please verify totals carefully.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Posting Failed</p>
            <p className="text-[11px] text-red-400/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Columns - Header and Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Header Details */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Supplier Profile</span>
                <h2 className="text-base font-bold text-foreground">{supplier.name}</h2>
                <div className="flex flex-col gap-1 text-[11px] text-muted-foreground mt-2">
                  {supplier.gstNumber && (
                    <span>
                      GSTIN:{' '}
                      <span className="font-mono font-semibold text-foreground">
                        {supplier.gstNumber}
                      </span>
                    </span>
                  )}
                  {supplier.address && <span>Addr: {supplier.address}</span>}
                  {(supplier.email || supplier.phone) && (
                    <span>
                      Contact: {supplier.email || '-'} | {supplier.phone || '-'}
                    </span>
                  )}
                </div>
              </div>

              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${getConfColor(confidence.supplier)}`}>
                <div className="text-right">
                  <p className="text-[9px] opacity-80">Supplier Confidence</p>
                  <p className="font-bold font-mono text-current">{(confidence.supplier * 100).toFixed(0)}%</p>
                </div>
                <span className={`w-2 h-2 rounded-full ${confidence.supplier >= 0.9 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/60">
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground">Invoice Number</p>
                <p className="font-bold text-foreground font-mono">{invoice.invoiceNumber || 'Not Found'}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground">Invoice Date</p>
                <p className="font-semibold text-foreground">
                  {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'Not Found'}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground">PO Ref Number</p>
                <p className="font-semibold text-foreground font-mono">{invoice.poNumber || '-'}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground">Payment Terms</p>
                <p className="font-semibold text-foreground">{invoice.paymentTerms || 'Standard'}</p>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-secondary/10 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Line Items & Mapping Reconciliation</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Confirm matched raw materials/products, stage new items, or ignore columns.
                </p>
              </div>
              <div className="flex gap-2">
                {pendingDecisions > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[9px]">
                    {pendingDecisions} Needs Mapping
                  </span>
                )}
                {unresolvedNew > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-[9px]">
                    {unresolvedNew} New Unresolved
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/5 text-muted-foreground font-bold">
                    <th className="p-3 pl-6 w-8 text-center">#</th>
                    <th className="p-3">Invoice Product Name</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Tax%</th>
                    <th className="p-3 text-right">Line Total</th>
                    <th className="p-3 text-center pl-4 pr-6">ERP Database Match Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {matchedItems.map((item, index) => {
                    const match = item.match || { matchType: 'new', confidence: 0 };
                    const hasAction = !!item.userAction;

                    // Compute tax rate %
                    const lineSub = item.quantity * item.unitPrice;
                    const taxVal = (item.cgst || 0) + (item.sgst || 0) + (item.igst || 0);
                    const taxRate = lineSub > 0 ? Math.round((taxVal / lineSub) * 100) : 0;

                    return (
                      <tr key={index} className="hover:bg-secondary/15 transition-colors group">
                        <td className="p-3 pl-6 font-mono text-center text-muted-foreground">{index + 1}</td>
                        <td className="p-3">
                          <div className="font-semibold text-foreground leading-tight">{item.productName}</div>
                          {item.description && <div className="text-[10px] text-muted-foreground/80 mt-0.5">{item.description}</div>}
                          {item.hsnCode && <div className="text-[9px] text-muted-foreground/60 mt-1">HSN: {item.hsnCode}</div>}
                        </td>
                        <td className="p-3 text-right font-semibold font-mono text-foreground">
                          {item.quantity} <span className="text-[10px] text-muted-foreground/80 font-normal">{item.unit || 'pcs'}</span>
                        </td>
                        <td className="p-3 text-right font-mono text-muted-foreground">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono text-muted-foreground">{taxRate}%</td>
                        <td className="p-3 text-right font-bold font-mono text-foreground">₹{item.lineTotal.toFixed(2)}</td>

                        {/* Database matching control */}
                        <td className="p-3 text-center pr-6 pl-4 w-[280px]">
                          <div className="flex flex-col items-center gap-1.5">
                            {/* Visual Match indicator */}
                            {!hasAction ? (
                              match.matchType === 'exact' ? (
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Auto Mapped
                                </div>
                              ) : match.matchType === 'alias' ? (
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                                  <Sparkles className="h-3.5 w-3.5" />
                                  Alias Match: {match.matchedName}
                                </div>
                              ) : match.matchType === 'fuzzy' ? (
                                <div className="flex flex-col gap-1 items-center">
                                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[9px]">
                                    <AlertTriangle className="h-3 w-3" />
                                    Fuzzy Suggestion ({Math.round(match.confidence * 100)}%)
                                  </div>
                                  <p className="text-[10px] text-muted-foreground">&ldquo;{match.matchedName}&rdquo;?</p>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-[10px]">
                                  <HelpCircle className="h-3.5 w-3.5" />
                                  Not Found in DB
                                </div>
                              )
                            ) : (
                              /* User resolved states */
                              item.userAction === 'auto' ? (
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Mapped to &ldquo;{match.matchedName}&rdquo;
                                </div>
                              ) : item.userAction === 'map' ? (
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold text-[10px]">
                                  <Database className="h-3.5 w-3.5" />
                                  Mapped to &ldquo;{item.userMappedName}&rdquo;
                                </div>
                              ) : item.userAction === 'create' ? (
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-[10px]">
                                  <PlusCircle className="h-3.5 w-3.5" />
                                  Staged as New SKU
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary/80 border border-border text-muted-foreground font-bold text-[10px] line-through">
                                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground/60" />
                                  Ignored
                                </div>
                              )
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 mt-1">
                              {/* Confirm Fuzzy suggestion button */}
                              {!hasAction && match.matchType === 'fuzzy' && (
                                <button
                                  type="button"
                                  onClick={() => updateItemDecision(index, { userAction: 'auto' })}
                                  className="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[9px] transition-colors"
                                >
                                  Confirm
                                </button>
                              )}

                              {/* Open Search/Map selector */}
                              <button
                                type="button"
                                onClick={() => openMatchSelector(index)}
                                className="px-2 py-0.5 rounded border border-border bg-secondary/30 text-foreground font-semibold hover:bg-secondary/60 text-[9px] transition-colors flex items-center gap-0.5"
                              >
                                {hasAction ? 'Remap' : 'Map Item'}
                              </button>

                              {/* Create wizard */}
                              <button
                                type="button"
                                onClick={() => openWizard(index)}
                                className="px-2 py-0.5 rounded border border-border bg-secondary/30 text-foreground font-semibold hover:bg-secondary/60 text-[9px] transition-colors"
                              >
                                {item.userAction === 'create' ? 'Edit Staged' : 'Register New'}
                              </button>

                              {/* Ignore / Delete item toggler */}
                              {item.userAction !== 'ignore' ? (
                                <button
                                  type="button"
                                  onClick={() => updateItemDecision(index, { userAction: 'ignore' })}
                                  className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="Ignore and do not receive this line item"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => updateItemDecision(index, { userAction: undefined })}
                                  className="p-1 rounded text-muted-foreground hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                                  title="Reset ignore decision"
                                >
                                  <Undo2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Column - Financials and Approval Settings */}
        <div className="space-y-6">
          {/* Warehouse destination selector */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Building className="h-4.5 w-4.5 text-sky-400" />
              ERP Destination Inventory
            </h3>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-semibold">Select Receiving Warehouse *</label>
              <select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs focus:outline-none focus:border-sky-500"
              >
                <option value="">-- Choose Warehouse --</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Financial Breakdown Panel */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <div>
              <h3 className="font-bold text-sm">Financial Auditing</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Calculated financial breakdown from OCR.</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal (Net)</span>
                <span className="font-mono text-foreground">₹{financials.subtotal.toFixed(2)}</span>
              </div>
              {financials.totalDiscount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Discount</span>
                  <span className="font-mono text-emerald-400">-₹{financials.totalDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* GST breakdown */}
              {financials.cgst > 0 && (
                <div className="flex justify-between text-muted-foreground pl-2 border-l border-border">
                  <span>CGST</span>
                  <span className="font-mono text-foreground">₹{financials.cgst.toFixed(2)}</span>
                </div>
              )}
              {financials.sgst > 0 && (
                <div className="flex justify-between text-muted-foreground pl-2 border-l border-border">
                  <span>SGST</span>
                  <span className="font-mono text-foreground">₹{financials.sgst.toFixed(2)}</span>
                </div>
              )}
              {financials.igst > 0 && (
                <div className="flex justify-between text-muted-foreground pl-2 border-l border-border">
                  <span>IGST</span>
                  <span className="font-mono text-foreground">₹{financials.igst.toFixed(2)}</span>
                </div>
              )}

              <div className="h-px bg-border/60" />

              {/* Extra Charges */}
              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-muted-foreground/75" /> Freight Charges
                </span>
                <span className="font-mono text-foreground">₹{financials.freight.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Packing & Handling</span>
                <span className="font-mono text-foreground">₹{financials.packingCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Round Off Adjustment</span>
                <span className="font-mono text-foreground">₹{financials.roundOff.toFixed(2)}</span>
              </div>

              <div className="h-px bg-border" />

              <div className="flex justify-between items-center text-sm font-bold pt-1.5">
                <span>Grand Total</span>
                <span className="font-mono text-sky-400 text-base">₹{financials.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleApprove}
                disabled={!canApprove || isApproving}
                className={`
                  w-full h-11 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer
                  ${canApprove && !isApproving
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 hover:scale-[1.01] hover:bg-sky-600'
                    : 'bg-secondary text-muted-foreground/60 border border-border cursor-not-allowed'
                  }
                `}
              >
                {isApproving ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Posting to ERP...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4.5 w-4.5" />
                    Approve & Post to ERP
                  </>
                )}
              </button>

              {/* Visual guidance text if not ready */}
              {!canApprove && !isApproving && (
                <p className="text-[10px] text-amber-400 text-center leading-normal px-2">
                  {pendingDecisions > 0 || unresolvedNew > 0
                    ? `⚠️ Map the remaining ${pendingDecisions + unresolvedNew} item(s) in the table before posting.`
                    : '⚠️ Select a receiving warehouse location first.'}
                </p>
              )}

              <button
                type="button"
                onClick={reset}
                className="w-full h-10 rounded-xl border border-border text-foreground hover:bg-secondary/40 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className="h-4 w-4" />
                Upload Different File
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popups & Wizards */}
      {wizardItemIndex !== null && (
        <NewProductWizard
          itemIndex={wizardItemIndex}
          item={matchedItems[wizardItemIndex]}
          onClose={closeWizard}
          onConfirm={confirmNewProduct}
        />
      )}

      {matchSelectorIndex !== null && (
        <ProductMatchSelector
          item={matchedItems[matchSelectorIndex]}
          onClose={closeMatchSelector}
          onSelect={(selected) => confirmMatchSelection(matchSelectorIndex, selected)}
        />
      )}
    </div>
  );
}
