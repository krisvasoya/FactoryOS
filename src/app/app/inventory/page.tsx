'use client';

import React, { useState, useEffect } from 'react';
import { Search, ArrowLeftRight, AlertTriangle, QrCode } from 'lucide-react';
import { TableSkeleton } from '@/components/skeleton';

interface Warehouse {
  id: string;
  name: string;
  location: string | null;
}

interface InventoryItem {
  id: string;
  warehouseId: string;
  productId: string | null;
  rawMaterialId: string | null;
  quantity: number;
  batchNumber: string | null;
  warehouse: Warehouse;
  product?: { name: string; sku: string; type: string; unit: string } | null;
  rawMaterial?: { name: string; sku: string; minStock: number; unit: string } | null;
}

interface StockMovement {
  id: string;
  productId: string | null;
  rawMaterialId: string | null;
  quantity: number;
  type: string;
  reference: string | null;
  notes: string | null;
  createdAt: string;
  sourceWarehouse?: Warehouse | null;
  destWarehouse?: Warehouse | null;
}

export default function InventoryPage() {
  const [data, setData] = useState<{ warehouses: Warehouse[]; inventoryItems: InventoryItem[]; movements: StockMovement[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'levels' | 'movements'>('levels');

  // Form State
  const [warehouseId, setWarehouseId] = useState('');
  const [type, setType] = useState('Receive'); // Receive, Issue, Transfer
  const [itemId, setItemId] = useState(''); // combined SKU selector
  const [quantity, setQuantity] = useState('');
  const [destWarehouseId, setDestWarehouseId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Catalog selectors (for form populate)
  const [catalogItems, setCatalogItems] = useState<Array<{ id: string; name: string; sku: string; kind: 'product' | 'material' }>>([]);

  async function loadInventory() {
    try {
      const res = await fetch('/api/v1/inventory');
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
        if (payload.warehouses.length > 0) {
          setWarehouseId(payload.warehouses[0].id);
          setDestWarehouseId(payload.warehouses[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadSelectors() {
    try {
      const [prodsRes, matsRes] = await Promise.all([
        fetch('/api/v1/products'),
        fetch('/api/v1/raw-materials'),
      ]);
      if (prodsRes.ok && matsRes.ok) {
        const prods = await prodsRes.json();
        const mats = await matsRes.json();
        const combined = [
          ...prods.map((p: { id: string; name: string; sku: string }) => ({ id: p.id, name: p.name, sku: p.sku, kind: 'product' as const })),
          ...mats.map((m: { id: string; name: string; sku: string }) => ({ id: m.id, name: m.name, sku: m.sku, kind: 'material' as const })),
        ];
        setCatalogItems(combined);
        if (combined.length > 0) setItemId(combined[0].id + '|' + combined[0].kind);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      loadInventory();
      loadSelectors();
    }, 0);
  }, []);

  const handleAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const [realId, kind] = itemId.split('|');
    const payload = {
      warehouseId,
      productId: kind === 'product' ? realId : undefined,
      rawMaterialId: kind === 'material' ? realId : undefined,
      quantity,
      type,
      destWarehouseId: type === 'Transfer' ? destWarehouseId : undefined,
      batchNumber,
      notes,
    };

    try {
      const res = await fetch('/api/v1/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAdjustModal(false);
        setQuantity('');
        setBatchNumber('');
        setNotes('');
        loadInventory();
      } else {
        const payloadErr = await res.json();
        setError(payloadErr.error || 'Failed to complete transaction.');
      }
    } catch {
      setError('Connection failure.');
    }
  };

  const filteredItems = data?.inventoryItems.filter((item) => {
    const name = item.product?.name || item.rawMaterial?.name || '';
    const sku = item.product?.sku || item.rawMaterial?.sku || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      sku.toLowerCase().includes(search.toLowerCase()) ||
      (item.batchNumber && item.batchNumber.toLowerCase().includes(search.toLowerCase()))
    );
  });

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Warehouse inventory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track real-time stock levels, record warehouse transfers, and view material movements.
          </p>
        </div>
        <button
          onClick={() => setShowAdjustModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2.5 text-xs shadow-md hover:scale-[1.02] hover:opacity-90 transition-all cursor-pointer"
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span>Post Stock Action</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('levels')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'levels'
                ? 'text-primary dark:text-sky-400 border-b-2 border-primary dark:border-sky-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Inventory Stock Levels
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'movements'
                ? 'text-primary dark:text-sky-400 border-b-2 border-primary dark:border-sky-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Transaction Movement logs
          </button>
        </div>
        <div className="relative w-72 mb-2">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search items, batch numbers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-xs focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {activeTab === 'levels' ? (
        filteredItems?.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
            No stock entries. Record a Receive action to populate inventory levels.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Left columns: Inventory levels list */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden lg:col-span-2">
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
                  {filteredItems?.map((item) => {
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

            {/* Right: Barcode simulation visualization */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <QrCode className="h-4 w-4 text-sky-400" /> Barcode/QR Tag Generator
                </h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Select any database catalog SKU to visualize a high-fidelity scannable asset tag.
                </p>

                <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 flex flex-col items-center justify-center space-y-3 shadow-inner">
                  <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                    FactoryOS Asset Tag
                  </div>
                  {/* Mock Barcode display */}
                  <div className="h-10 w-full bg-white flex items-center justify-around px-2 py-1 relative overflow-hidden rounded">
                    <div className="flex gap-[2px] items-stretch h-full w-full justify-center">
                      {[1, 3, 1, 2, 4, 1, 2, 1, 3, 1, 4, 2, 1, 2, 1, 3, 1, 2, 4, 1, 2, 1].map((w, idx) => (
                        <div
                          key={idx}
                          className="bg-black"
                          style={{ width: `${w * 2}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="font-mono text-xs text-white tracking-widest">
                    *FG-SMT-T1*
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Auto-generated. Attach tag to finished assembly box.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Movements Log Table */
        data?.movements.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
            No logged stock movements found.
          </div>
        ) : (
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
                {data?.movements.map((move) => {
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
        )
      )}

      {/* Adjust Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-sky-400" /> Post Stock Adjustment
              </span>
              <button onClick={() => setShowAdjustModal(false)} className="text-muted-foreground hover:text-foreground text-xs">
                Cancel
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleAdjustment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Action Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
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
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
                  >
                    {data?.warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {type === 'Transfer' && (
                <div className="space-y-1">
                  <label className="font-semibold">Destination Warehouse *</label>
                  <select
                    value={destWarehouseId}
                    onChange={(e) => setDestWarehouseId(e.target.value)}
                    className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
                  >
                    {data?.warehouses.map((wh) => (
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
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
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
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="100"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Batch/Lot Number</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="Batch-2026A"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Reasoning / Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
      )}
    </div>
  );
}
