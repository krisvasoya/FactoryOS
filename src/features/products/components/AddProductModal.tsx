'use client';

import React from 'react';
import { Tag } from 'lucide-react';

interface AddProductModalProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  form: {
    name: string;
    setName: (val: string) => void;
    sku: string;
    setSku: (val: string) => void;
    description: string;
    setDescription: (val: string) => void;
    price: string;
    setPrice: (val: string) => void;
    cost: string;
    setCost: (val: string) => void;
    unit: string;
    setUnit: (val: string) => void;
    type: string;
    setType: (val: string) => void;
  };
}

export function AddProductModal({ onClose, onSubmit, error, form }: AddProductModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <span className="font-bold text-sm flex items-center gap-2">
            <Tag className="h-4 w-4 text-sky-400" /> Add Product Item
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
              <label className="font-semibold">SKU ID *</label>
              <input
                type="text"
                required
                value={form.sku}
                onChange={(e) => form.setSku(e.target.value)}
                placeholder="e.g. FG-SMT-T1"
                className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold">Type</label>
              <select
                value={form.type}
                onChange={(e) => form.setType(e.target.value)}
                className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
              >
                <option value="Finished">Finished Good</option>
                <option value="SemiFinished">Semi-Finished</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold">Product Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => form.setName(e.target.value)}
              placeholder="Apex Smart Controller"
              className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => form.setDescription(e.target.value)}
              placeholder="Summary of product assembly features"
              className="w-full h-16 border border-border rounded-xl bg-secondary/20 p-2.5 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold">Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => form.setPrice(e.target.value)}
                placeholder="120.00"
                className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold">Cost (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.cost}
                onChange={(e) => form.setCost(e.target.value)}
                placeholder="45.00"
                className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold">Unit</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => form.setUnit(e.target.value)}
                placeholder="pcs"
                className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[0.98] hover:opacity-90 transition-all cursor-pointer"
          >
            Register Product Item
          </button>
        </form>
      </div>
    </div>
  );
}
