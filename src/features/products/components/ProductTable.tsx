'use client';

import React from 'react';
import { Package } from 'lucide-react';
import { Product } from '../hooks/useProducts';

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
        No products found. Add a product to configure your catalog.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-secondary/20 text-muted-foreground">
            <th className="p-4 font-semibold">Product Details</th>
            <th className="p-4 font-semibold">SKU Code</th>
            <th className="p-4 font-semibold">Unit Type</th>
            <th className="p-4 font-semibold">Selling Price</th>
            <th className="p-4 font-semibold">Assembly Cost</th>
            <th className="p-4 font-semibold">Margins</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {products.map((prod) => {
            const profit = prod.price - prod.cost;
            const marginPercent = prod.price > 0 ? ((profit / prod.price) * 100).toFixed(1) : '0';

            return (
              <tr key={prod.id} className="hover:bg-secondary/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Package className="h-4 w-4 text-sky-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{prod.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{prod.description || 'No description'}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-mono font-medium">{prod.sku}</td>
                <td className="p-4 text-muted-foreground">{prod.unit}</td>
                <td className="p-4 font-bold text-foreground">₹{prod.price.toFixed(2)}</td>
                <td className="p-4 text-muted-foreground">₹{prod.cost.toFixed(2)}</td>
                <td className="p-4">
                  <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-500">
                    {marginPercent}% Margin
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
