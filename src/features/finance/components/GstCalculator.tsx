'use client';

import React from 'react';
import { Percent } from 'lucide-react';

interface GstCalculatorProps {
  gstAmountInput: string;
  setGstAmountInput: (val: string) => void;
  gstRate: string;
  setGstRate: (val: string) => void;
  calculatedGST: { tax: number; total: number } | null;
  onCalculate: () => void;
}

export function GstCalculator({
  gstAmountInput,
  setGstAmountInput,
  gstRate,
  setGstRate,
  calculatedGST,
  onCalculate,
}: GstCalculatorProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Percent className="h-4 w-4 text-sky-400" /> Inline GST Tax Calculator
      </h3>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Compute values quickly to calculate tax overhead.
      </p>

      <div className="space-y-3 text-xs">
        <div className="space-y-1">
          <label className="font-semibold text-muted-foreground">Pre-Tax Base Amount (₹)</label>
          <input
            type="number"
            value={gstAmountInput}
            onChange={(e) => setGstAmountInput(e.target.value)}
            placeholder="1000.00"
            className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-muted-foreground">Tax GST Rate (%)</label>
          <select
            value={gstRate}
            onChange={(e) => setGstRate(e.target.value)}
            className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
          >
            <option value="5">5% GST</option>
            <option value="12">12% GST</option>
            <option value="18">18% GST (Standard)</option>
            <option value="28">28% GST</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onCalculate}
          className="w-full h-9 rounded-xl bg-secondary text-primary font-bold hover:bg-secondary/70 transition-colors"
        >
          Compute GST
        </button>

        {calculatedGST && (
          <div className="rounded-xl border border-border bg-secondary/10 p-3 space-y-1.5 text-[10px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Computed GST Tax:</span>
              <span className="font-semibold text-foreground">₹{calculatedGST.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 text-xs font-bold">
              <span className="text-muted-foreground">Invoice Grand Total:</span>
              <span className="text-primary">₹{calculatedGST.total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
