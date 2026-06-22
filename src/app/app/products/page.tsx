'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Tag } from 'lucide-react';
import { TableSkeleton } from '@/components/skeleton';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  unit: string;
  type: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [type, setType] = useState('Finished');
  const [error, setError] = useState('');

  async function loadProducts() {
    try {
      const res = await fetch('/api/v1/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      loadProducts();
    }, 0);
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, sku, description, price, cost, unit, type }),
      });

      if (res.ok) {
        setShowModal(false);
        // Reset form
        setName('');
        setSku('');
        setDescription('');
        setPrice('');
        setCost('');
        loadProducts();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create product.');
      }
    } catch {
      setError('Connection failure.');
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Finished Goods catalog</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage finished and semi-finished product catalog codes, pricing details, and manufacturing values.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2.5 text-xs shadow-md hover:scale-[1.02] hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4 text-slate-950" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Control panel */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by SKU, item name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-xs focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Catalog Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
          No products found. Add a product to configure your catalog.
        </div>
      ) : (
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
              {filtered.map((prod) => {
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
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                <Tag className="h-4 w-4 text-sky-400" /> Add Product Item
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

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">SKU ID *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. FG-SMT-T1"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Apex Smart Controller"
                  className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
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
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="45.00"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
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
      )}
    </div>
  );
}
