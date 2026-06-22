'use client';

import React from 'react';
import { Receipt } from 'lucide-react';
import { Customer } from '../hooks/useFinance';

interface InvoiceModalProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  customers: Customer[];
  form: {
    customerId: string;
    setCustomerId: (val: string) => void;
    subTotal: string;
    setSubTotal: (val: string) => void;
    dueDate: string;
    setDueDate: (val: string) => void;
  };
}

export function InvoiceModal({ onClose, onSubmit, error, customers, form }: InvoiceModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <span className="font-bold text-sm flex items-center gap-2">
            <Receipt className="h-4 w-4 text-sky-400" /> Create Client Invoice
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
          <div className="space-y-1">
            <label className="font-semibold">Linked Customer Account *</label>
            <select
              value={form.customerId}
              onChange={(e) => form.setCustomerId(e.target.value)}
              className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
              required
            >
              {customers.length === 0 ? (
                <option value="" disabled>No customer accounts found. Create one under Contacts first!</option>
              ) : (
                customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold">Pre-Tax Subtotal (₹) *</label>
              <input
                type="number"
                required
                value={form.subTotal}
                onChange={(e) => form.setSubTotal(e.target.value)}
                placeholder="1000.00"
                className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold">Invoice Due Date *</label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={(e) => form.setDueDate(e.target.value)}
                className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none text-[10px]"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-secondary/15 p-3 text-[10px] text-muted-foreground">
            Note: Creating this invoice automatically calculates the standard <strong>18% GST tax rate</strong>, adding it to the subtotal amount dynamically.
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[0.98] hover:opacity-90 transition-all cursor-pointer"
          >
            Issue Invoice & Log GST
          </button>
        </form>
      </div>
    </div>
  );
}
