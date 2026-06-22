'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, Activity } from 'lucide-react';

interface RawMaterial {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  cost: number;
  unit: string;
  minStock: number;
}

export default function RawMaterialsPage() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [unit, setUnit] = useState('kg');
  const [minStock, setMinStock] = useState('');
  const [error, setError] = useState('');

  async function loadMaterials() {
    try {
      const res = await fetch('/api/v1/raw-materials');
      if (res.ok) {
        const data = await res.json();
        setMaterials(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      loadMaterials();
    }, 0);
  }, []);

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/v1/raw-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, sku, description, cost, unit, minStock }),
      });

      if (res.ok) {
        setShowModal(false);
        // Reset form
        setName('');
        setSku('');
        setDescription('');
        setCost('');
        setMinStock('');
        loadMaterials();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create material.');
      }
    } catch {
      setError('Connection failure.');
    }
  };

  const filtered = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Raw Materials Catalog</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure raw component items, unit costs, and safety stock levels for automated production orders.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 px-4 py-2.5 text-slate-950 font-bold text-xs shadow-md shadow-indigo-600/10 hover:scale-[1.02] transition-transform cursor-pointer"
        >
          <Plus className="h-4 w-4 text-slate-950" />
          <span>Add Raw Material</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by SKU, material name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-xs focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Catalog Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
          <Activity className="h-5 w-5 animate-spin mr-2 text-sky-400" />
          Loading material catalog...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
          No raw materials in database. Register raw materials to build BOM sheets.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/20 text-muted-foreground">
                <th className="p-4 font-semibold">Material Details</th>
                <th className="p-4 font-semibold">SKU Code</th>
                <th className="p-4 font-semibold">Unit Cost</th>
                <th className="p-4 font-semibold">Base Unit</th>
                <th className="p-4 font-semibold">Safety Stock Threshold</th>
                <th className="p-4 font-semibold">Status Indicator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((mat) => (
                <tr key={mat.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
                        <Layers className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{mat.name}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{mat.description || 'No description'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-medium">{mat.sku}</td>
                  <td className="p-4 font-bold text-foreground">${mat.cost.toFixed(2)}</td>
                  <td className="p-4 text-muted-foreground">{mat.unit}</td>
                  <td className="p-4 font-medium">{mat.minStock} {mat.unit}</td>
                  <td className="p-4">
                    <span className="rounded-lg bg-indigo-500/10 px-2 py-1 text-[10px] font-bold text-indigo-500">
                      Standard
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                <Plus className="h-4 w-4 text-sky-400" /> Add Raw Material
              </span>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-xs">
                Cancel
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleAddMaterial} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">SKU ID *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. RM-PLA-ABS"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Base Unit *</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. kg, pcs, liters"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Material Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ABS Premium Resin"
                  className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter details of density, grade, or storage settings..."
                  className="w-full h-16 border border-border rounded-xl bg-secondary/20 p-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Purchase Cost ($) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="2.50"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Safety Stock Threshold *</label>
                  <input
                    type="number"
                    required
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    placeholder="500"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 text-slate-950 font-bold hover:scale-[0.98] transition-transform cursor-pointer"
              >
                Register Raw Material
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
