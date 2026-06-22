'use client';

import React from 'react';
import { Receipt } from 'lucide-react';

interface ExpenseModalProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  form: {
    expCategory: string;
    setExpCategory: (val: string) => void;
    expAmount: string;
    setExpAmount: (val: string) => void;
    expDesc: string;
    setExpDesc: (val: string) => void;
  };
}

export function ExpenseModal({ onClose, onSubmit, error, form }: ExpenseModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <span className="font-bold text-sm flex items-center gap-2">
            <Receipt className="h-4 w-4 text-red-400" /> Log Factory Expense
          </span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs">
            Cancel
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold">Ledger Category *</label>
              <select
                value={form.expCategory}
                onChange={(e) => form.setExpCategory(e.target.value)}
                className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
              >
                <option value="Raw Materials">Raw Materials</option>
                <option value="Salaries">Worker Salaries</option>
                <option value="Utilities">Factory Utilities</option>
                <option value="Maintenance">Machine Repair</option>
                <option value="Other">Other Miscellaneous</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold">Cash Outflow Amount (₹) *</label>
              <input
                type="number"
                required
                value={form.expAmount}
                onChange={(e) => form.setExpAmount(e.target.value)}
                placeholder="250.00"
                className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold">Description / Notes</label>
            <input
              type="text"
              value={form.expDesc}
              onChange={(e) => form.setExpDesc(e.target.value)}
              placeholder="e.g. Solder paste purchase lot"
              className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[0.98] hover:opacity-90 transition-all cursor-pointer"
          >
            Log Outflow Expense
          </button>
        </form>
      </div>
    </div>
  );
}
