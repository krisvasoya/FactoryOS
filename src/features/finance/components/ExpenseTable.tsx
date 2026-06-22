'use client';

import React from 'react';
import { Expense } from '../hooks/useFinance';

interface ExpenseTableProps {
  expenses: Expense[];
}

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
        No logged expenses.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-secondary/20 text-muted-foreground">
            <th className="p-4 font-semibold">Expense Date</th>
            <th className="p-4 font-semibold">Ledger Category</th>
            <th className="p-4 font-semibold">Description</th>
            <th className="p-4 font-semibold">Outflow Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {expenses.map((exp) => (
            <tr key={exp.id} className="hover:bg-secondary/20 transition-colors">
              <td className="p-4 text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</td>
              <td className="p-4">
                <span className="rounded-lg bg-secondary px-2 py-0.5 text-[10px] font-bold text-primary">
                  {exp.category}
                </span>
              </td>
              <td className="p-4 text-muted-foreground leading-relaxed">{exp.description || 'N/A'}</td>
              <td className="p-4 font-bold text-red-500">₹{exp.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
