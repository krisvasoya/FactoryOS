'use client';

import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Warehouse, CatalogItem } from '../hooks/useInventory';

interface StockActionModalProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  warehouses: Warehouse[];
  catalogItems: CatalogItem[];
  form: {
    warehouseId: string;
    setWarehouseId: (val: string) => void;
    type: string;
    setType: (val: string) => void;
    itemId: string;
    setItemId: (val: string) => void;
    quantity: string;
    setQuantity: (val: string) => void;
    destWarehouseId: string;
    setDestWarehouseId: (val: string) => void;
    batchNumber: string;
    setBatchNumber: (val: string) => void;
    notes: string;
    setNotes: (val: string) => void;
  };
}

export function StockActionModal({ onClose, onSubmit, error, warehouses, catalogItems, form }: StockActionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <span className="font-bold text-sm flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-sky-400" /> Post Stock Adjustment
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
              <label className="font-semibold">Action Type</label>
              <select
                value={form.type}
                onChange={(e) => form.setType(e.target.value)}
                className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
              >
                <option value="Receive">Receive Stock</option>
                <option value="Issue">Issue Stock</option>
                <option value="Transfer">Transfer Warehouses</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold">Target Warehouse</label>
              <select
                value={form.warehouseId}
                onChange={(e) => form.setWarehouseId(e.target.value)}
                className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
              >
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {form.type === 'Transfer' && (
            <div className="space-y-1">
              <label className="font-semibold">Destination Warehouse *</label>
              <select
                value={form.destWarehouseId}
                onChange={(e) => form.setDestWarehouseId(e.target.value)}
                className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
              >
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold">Catalog Asset Item *</label>
            <select
              value={form.itemId}
              onChange={(e) => form.setItemId(e.target.value)}
              className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
            >
              {catalogItems.map((item) => (
                <option key={item.id + '|' + item.kind} value={item.id + '|' + item.kind}>
                  [{item.kind.toUpperCase()}] {item.sku} - {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold">Quantity *</label>
              <input
                type="number"
                required
                value={form.quantity}
                onChange={(e) => form.setQuantity(e.target.value)}
                placeholder="100"
                className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold">Batch/Lot Number</label>
              <input
                type="text"
                value={form.batchNumber}
                onChange={(e) => form.setBatchNumber(e.target.value)}
                placeholder="Batch-2026A"
                className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold">Reasoning / Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => form.setNotes(e.target.value)}
              placeholder="Cycle count, supplier delivery, or assembly usage..."
              className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[0.98] hover:opacity-90 transition-all cursor-pointer"
          >
            Log Transaction Action
          </button>
        </form>
      </div>
    </div>
  );
}
