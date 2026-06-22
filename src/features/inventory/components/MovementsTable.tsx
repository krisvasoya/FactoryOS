'use client';

import React from 'react';
import { StockMovement, CatalogItem } from '../hooks/useInventory';

interface MovementsTableProps {
  movements: StockMovement[];
  catalogItems: CatalogItem[];
}

export function MovementsTable({ movements, catalogItems }: MovementsTableProps) {
  if (movements.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
        No logged stock movements found.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-secondary/20 text-muted-foreground">
            <th className="p-4 font-semibold">Transaction Date</th>
            <th className="p-4 font-semibold">Item Details</th>
            <th className="p-4 font-semibold">Movement Type</th>
            <th className="p-4 font-semibold">Stock Quantity</th>
            <th className="p-4 font-semibold">Warehouse Path</th>
            <th className="p-4 font-semibold">Reference / Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {movements.map((move) => {
            const dateStr = new Date(move.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const itemSelector = catalogItems.find((c) => c.id === (move.productId || move.rawMaterialId));
            const itemName = itemSelector?.name || 'Warehouse Asset';

            return (
              <tr key={move.id} className="hover:bg-secondary/20 transition-colors">
                <td className="p-4 text-muted-foreground">{dateStr}</td>
                <td className="p-4 font-semibold text-foreground">{itemName}</td>
                <td className="p-4">
                  <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold ${
                    move.type === 'Receive'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : move.type === 'Issue'
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {move.type}
                  </span>
                </td>
                <td className="p-4 font-bold text-foreground">
                  {move.quantity}
                </td>
                <td className="p-4 text-muted-foreground">
                  {move.type === 'Receive' && `Dest: ${move.destWarehouse?.name}`}
                  {move.type === 'Issue' && `Source: ${move.sourceWarehouse?.name}`}
                  {move.type === 'Transfer' && `${move.sourceWarehouse?.name} → ${move.destWarehouse?.name}`}
                </td>
                <td className="p-4">
                  <div className="text-[10px] font-mono text-muted-foreground">{move.reference || 'N/A'}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5 italic">{move.notes}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
