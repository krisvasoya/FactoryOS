'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { InventoryItem } from '../hooks/useInventory';

interface StockLevelsTableProps {
  items: InventoryItem[];
}

export function StockLevelsTable({ items }: StockLevelsTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
        No stock entries. Record a Receive action to populate inventory levels.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-secondary/20 text-muted-foreground">
            <th className="p-4 font-semibold">Catalog Item</th>
            <th className="p-4 font-semibold">Warehouse</th>
            <th className="p-4 font-semibold">Batch Number</th>
            <th className="p-4 font-semibold">In-Stock Quantity</th>
            <th className="p-4 font-semibold">Safety Margin</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {items.map((item) => {
            const name = item.product?.name || item.rawMaterial?.name || 'Unknown Item';
            const sku = item.product?.sku || item.rawMaterial?.sku || 'N/A';
            const kind = item.product ? 'Product' : 'Material';
            
            // Safety check
            const minStock = item.rawMaterial?.minStock || 0;
            const unit = item.rawMaterial?.unit || item.product?.unit || 'pcs';
            const isLowStock = item.rawMaterial && item.quantity < minStock;

            return (
              <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-foreground">{name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <span className="font-mono font-medium">{sku}</span> • <span>{kind}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{item.warehouse.name}</td>
                <td className="p-4">
                  <span className="font-mono bg-secondary/50 px-2 py-0.5 rounded text-[10px]">
                    {item.batchNumber || 'N/A'}
                  </span>
                </td>
                <td className="p-4 font-bold text-foreground">
                  {item.quantity} {unit}
                </td>
                <td className="p-4">
                  {isLowStock ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                      <AlertTriangle className="h-3 w-3" /> Low Stock
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-500 font-bold">Safe</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
