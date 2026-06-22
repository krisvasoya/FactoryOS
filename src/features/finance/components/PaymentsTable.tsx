'use client';

import React from 'react';
import { Payment } from '../hooks/useFinance';

interface PaymentsTableProps {
  payments: Payment[];
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
        No payment events processed.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-secondary/20 text-muted-foreground">
            <th className="p-4 font-semibold">Timestamp</th>
            <th className="p-4 font-semibold">Invoice Ref</th>
            <th className="p-4 font-semibold">Transfer Channel</th>
            <th className="p-4 font-semibold">Transaction Code</th>
            <th className="p-4 font-semibold">Cleared Inflow</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {payments.map((pay) => (
            <tr key={pay.id} className="hover:bg-secondary/20 transition-colors">
              <td className="p-4 text-muted-foreground">{new Date(pay.createdAt).toLocaleDateString()}</td>
              <td className="p-4 font-mono font-medium">{pay.invoice?.invoiceNumber}</td>
              <td className="p-4 text-foreground">{pay.method}</td>
              <td className="p-4 font-mono text-muted-foreground">{pay.reference || 'N/A'}</td>
              <td className="p-4 font-bold text-emerald-500">₹{pay.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
