'use client';

import React from 'react';
import { IndianRupee } from 'lucide-react';

interface PaymentModalProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  form: {
    paymentInvoiceId: string;
    paymentAmount: string;
    setPaymentAmount: (val: string) => void;
    paymentMethod: string;
    setPaymentMethod: (val: string) => void;
    paymentRef: string;
    setPaymentRef: (val: string) => void;
  };
}

export function PaymentModal({ onClose, onSubmit, error, form }: PaymentModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <span className="font-bold text-sm flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-sky-400" /> Record Client Payment
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
              <label className="font-semibold">Cleared Inflow Amount (₹) *</label>
              <input
                type="number"
                required
                value={form.paymentAmount}
                onChange={(e) => form.setPaymentAmount(e.target.value)}
                className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold">Transfer Channel *</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => form.setPaymentMethod(e.target.value)}
                className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
              >
                <option value="Bank">Bank Transfer</option>
                <option value="Cash">Cash Ledger</option>
                <option value="Card">Credit Card</option>
                <option value="UPI">UPI Payment</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold">Transaction Reference ID</label>
            <input
              type="text"
              value={form.paymentRef}
              onChange={(e) => form.setPaymentRef(e.target.value)}
              placeholder="e.g. TXN-998822"
              className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[0.98] hover:opacity-90 transition-all cursor-pointer"
          >
            Process Payment Inflow
          </button>
        </form>
      </div>
    </div>
  );
}
