'use client';

import React from 'react';
import { Invoice } from '../hooks/useFinance';

interface InvoiceTableProps {
  invoices: Invoice[];
  onRecordPayment: (inv: Invoice) => void;
  onPrintLayout: (inv: Invoice) => void;
}

export function InvoiceTable({ invoices, onRecordPayment, onPrintLayout }: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
        No invoices generated. Create an invoice to track billing details.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-secondary/20 text-muted-foreground">
            <th className="p-4 font-semibold">Invoice ID</th>
            <th className="p-4 font-semibold">Client Name</th>
            <th className="p-4 font-semibold">Due Date</th>
            <th className="p-4 font-semibold">Amount (Subtotal)</th>
            <th className="p-4 font-semibold">Status</th>
            <th className="p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-secondary/20 transition-colors">
              <td className="p-4 font-mono font-medium">{inv.invoiceNumber}</td>
              <td className="p-4 text-foreground font-semibold">{inv.customer?.name || 'Walk-in Client'}</td>
              <td className="p-4 text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString()}</td>
              <td className="p-4">
                <div className="font-bold text-foreground">₹{inv.totalAmount.toFixed(2)}</div>
                <div className="text-[9px] text-muted-foreground mt-0.5">GST Included: ₹{inv.taxAmount.toFixed(2)}</div>
              </td>
              <td className="p-4">
                <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold ${
                  inv.status === 'Paid'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {inv.status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  {inv.status === 'Unpaid' && (
                    <button
                      onClick={() => onRecordPayment(inv)}
                      className="text-[10px] text-sky-400 font-bold hover:underline"
                    >
                      Record Payment
                    </button>
                  )}
                  {inv.status === 'Paid' && (
                    <span className="text-[10px] text-muted-foreground">Cleared</span>
                  )}
                  <button
                    onClick={() => onPrintLayout(inv)}
                    className="text-[10px] text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    Print Layout
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
