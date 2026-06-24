'use client';

import React, { useState } from 'react';
import { X, Check, PackagePlus, AlertTriangle } from 'lucide-react';
import { MatchedItem } from '../hooks/useDocumentIntelligence';

interface NewProductWizardProps {
  itemIndex: number;
  item: MatchedItem;
  onClose: () => void;
  onConfirm: (index: number, newProductData: NonNullable<MatchedItem['newProductData']>) => void;
}

// Helper to auto-generate SKU suggestions based on name and type
function generateSku(name: string, type: 'rawMaterial' | 'product'): string {
  if (!name) return '';
  const cleanName = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .toUpperCase();
  const words = cleanName.split(/\s+/);
  let abbrev = '';
  if (words.length >= 2) {
    abbrev = words.slice(0, 3).map(w => w[0]).join('');
  } else {
    abbrev = words[0]?.slice(0, 4) || '';
  }
  const randomNum = Math.floor(100 + Math.random() * 900);
  const prefix = type === 'rawMaterial' ? 'RM' : 'PRD';
  return `${prefix}-${abbrev}-${randomNum}`;
}

export function NewProductWizard({
  itemIndex,
  item,
  onClose,
  onConfirm,
}: NewProductWizardProps) {
  const [type, setType] = useState<'rawMaterial' | 'product'>('rawMaterial');
  const [name, setName] = useState(item.productName);
  const [sku, setSku] = useState(() => generateSku(item.productName, 'rawMaterial'));
  const [isSkuTouched, setIsSkuTouched] = useState(false);
  const [unit, setUnit] = useState(item.unit || 'pcs');
  const [minStock, setMinStock] = useState('0');
  const [cost, setCost] = useState(item.unitPrice.toString());
  const [error, setError] = useState('');

  const handleTypeChange = (newType: 'rawMaterial' | 'product') => {
    setType(newType);
    if (!isSkuTouched) {
      setSku(generateSku(name, newType));
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isSkuTouched) {
      setSku(generateSku(newName, type));
    }
  };

  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSku(e.target.value);
    setIsSkuTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!sku.trim()) {
      setError('SKU is required');
      return;
    }

    const minStockVal = parseFloat(minStock);
    if (isNaN(minStockVal) || minStockVal < 0) {
      setError('Safety stock threshold must be a positive number');
      return;
    }

    onConfirm(itemIndex, {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      unit: unit.trim(),
      type,
      minStock: minStockVal,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/10">
          <div className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Register New Item</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Staging item for database insertion upon approval.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Toggle Type */}
          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground">Catalog Item Type</label>
            <div className="grid grid-cols-2 gap-2 bg-secondary/20 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('rawMaterial')}
                className={`py-2 rounded-lg font-bold transition-all ${
                  type === 'rawMaterial'
                    ? 'bg-card text-sky-400 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Raw Material
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('product')}
                className={`py-2 rounded-lg font-bold transition-all ${
                  type === 'product'
                    ? 'bg-card text-sky-400 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Finished Product
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground">Item Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. ABS Resin Grade 4"
              className="w-full h-9 border border-border rounded-xl bg-secondary/10 px-3 focus:outline-none focus:border-sky-500"
            />
            <p className="text-[10px] text-muted-foreground/60 italic">
              Extracted name: &ldquo;{item.productName}&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* SKU */}
            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground">SKU Code *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={handleSkuChange}
                placeholder="e.g. RM-ABS-302"
                className="w-full h-9 border border-border rounded-xl bg-secondary/10 px-3 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Base Unit */}
            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground">Base Unit *</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. kg, pcs, box"
                className="w-full h-9 border border-border rounded-xl bg-secondary/10 px-3 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Unit Cost */}
            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground">
                {type === 'rawMaterial' ? 'Purchase Cost (₹)' : 'Production Cost (₹)'}
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                className="w-full h-9 border border-border rounded-xl bg-secondary/10 px-3 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Safety Stock */}
            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground">Safety Stock Threshold</label>
              <input
                type="number"
                required
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                placeholder="0"
                className="w-full h-9 border border-border rounded-xl bg-secondary/10 px-3 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-9 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              Stage Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
