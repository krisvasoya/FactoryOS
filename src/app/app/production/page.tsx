'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, CheckCircle, XCircle, AlertTriangle, Layers } from 'lucide-react';
import { TableSkeleton } from '@/components/skeleton';

interface BOMItem {
  id: string;
  rawMaterial: { name: string; sku: string; unit: string };
  quantity: number;
}

interface BOM {
  id: string;
  name: string;
  version: string;
  product: { name: string; sku: string };
  items: BOMItem[];
}

interface ProductionOrder {
  id: string;
  quantity: number;
  status: string;
  cost: number;
  startDate: string | null;
  endDate: string | null;
  product: { name: string; sku: string };
  bom: { name: string };
  machine?: { name: string; code: string } | null;
}

export default function ProductionPage() {
  const [data, setData] = useState<{ boms: BOM[]; productionOrders: ProductionOrder[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'runs' | 'recipes'>('runs');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showBOMModal, setShowBOMModal] = useState(false);
  const [error, setError] = useState('');

  // Selector databases
  const [products, setProducts] = useState<Array<{ id: string; name: string; sku: string }>>([]);
  const [materials, setMaterials] = useState<Array<{ id: string; name: string; sku: string; unit: string }>>([]);
  const [machines, setMachines] = useState<Array<{ id: string; name: string; code: string }>>([]);

  // Production Order Form State
  const [bomId, setBomId] = useState('');
  const [machineId, setMachineId] = useState('');
  const [orderQty, setOrderQty] = useState('');

  // BOM Form State
  const [bomName, setBomName] = useState('');
  const [productId, setProductId] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<Array<{ rawMaterialId: string; quantity: string }>>([
    { rawMaterialId: '', quantity: '' },
  ]);

  const loadProduction = React.useCallback(async () => {
    try {
      const res = await fetch('/api/v1/production');
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
        if (payload.boms.length > 0) setBomId(payload.boms[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const [prodRes, prodsRes, matsRes] = await Promise.all([
          fetch('/api/v1/production'),
          fetch('/api/v1/products'),
          fetch('/api/v1/raw-materials'),
        ]);
        if (active) {
          if (prodRes.ok) {
            const payload = await prodRes.json();
            setData(payload);
            if (payload.boms.length > 0) setBomId(payload.boms[0].id);
          }
          if (prodsRes.ok && matsRes.ok) {
            setProducts(await prodsRes.json());
            setMaterials(await matsRes.json());
          }
          setMachines([
            { id: 'mch-smt-01', name: 'SMT Assembly Line 01', code: 'MCH-SMT-01' },
            { id: 'mch-inj-02', name: 'Plastic Injection Press 02', code: 'MCH-INJ-02' },
          ]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    init();
    return () => { active = false; };
  }, []);

  const handleStartOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetBOM = data?.boms.find((b) => b.id === bomId);
    if (!targetBOM) return;

    try {
      const res = await fetch('/api/v1/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createOrder',
          productId: products.find((p) => p.sku === targetBOM.product.sku)?.id,
          bomId,
          machineId: machineId || undefined,
          quantity: orderQty,
        }),
      });

      if (res.ok) {
        setShowOrderModal(false);
        setOrderQty('');
        loadProduction();
      } else {
        const errPayload = await res.json();
        setError(errPayload.error || 'Failed to initialize production run.');
      }
    } catch {
      setError('Connection failure.');
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/v1/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', orderId, status }),
      });
      if (res.ok) {
        loadProduction();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddBOMComponent = () => {
    setSelectedComponents([...selectedComponents, { rawMaterialId: '', quantity: '' }]);
  };

  const handleRemoveBOMComponent = (index: number) => {
    setSelectedComponents(selectedComponents.filter((_, idx) => idx !== index));
  };

  const handleBOMComponentChange = (index: number, field: string, value: string) => {
    const next = [...selectedComponents];
    next[index] = { ...next[index], [field]: value };
    setSelectedComponents(next);
  };

  const handleCreateBOM = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = {
      action: 'createBOM',
      productId,
      name: bomName,
      items: selectedComponents.filter((c) => c.rawMaterialId && c.quantity),
    };

    try {
      const res = await fetch('/api/v1/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowBOMModal(false);
        setBomName('');
        setProductId('');
        setSelectedComponents([{ rawMaterialId: '', quantity: '' }]);
        loadProduction();
      } else {
        const errPayload = await res.json();
        setError(errPayload.error || 'Failed to register BOM recipe.');
      }
    } catch {
      setError('Connection error.');
    }
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Production Execution</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure assembly recipes (BOM) and supervise live factory floor production runs.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (products.length > 0) setProductId(products[0].id);
              if (materials.length > 0) {
                setSelectedComponents([{ rawMaterialId: materials[0].id, quantity: '1' }]);
              }
              setShowBOMModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-secondary/40 transition-colors cursor-pointer"
          >
            <span>Create BOM Recipe</span>
          </button>
          <button
            onClick={() => setShowOrderModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2.5 text-xs shadow-md hover:scale-[1.02] hover:opacity-90 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-slate-950" />
            <span>Launch Order Run</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('runs')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'runs'
                ? 'text-primary dark:text-sky-400 border-b-2 border-primary dark:border-sky-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active Order Runs
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'recipes'
                ? 'text-primary dark:text-sky-400 border-b-2 border-primary dark:border-sky-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Bill of Materials (BOM)
          </button>
        </div>
      </div>

      {activeTab === 'runs' ? (
        /* Runs tracker dashboard */
        data?.productionOrders.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
            No production runs registered. Click Launch Order Run to start.
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/20 text-muted-foreground">
                  <th className="p-4 font-semibold">Assembly Item</th>
                  <th className="p-4 font-semibold">BOM Formula</th>
                  <th className="p-4 font-semibold">Allocated Machine</th>
                  <th className="p-4 font-semibold">Run Quantity</th>
                  <th className="p-4 font-semibold">Material Value Cost</th>
                  <th className="p-4 font-semibold">Live Status</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data?.productionOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4 font-semibold text-foreground">
                      {order.product.name}
                      <span className="text-[10px] text-muted-foreground block font-normal font-mono mt-0.5">{order.product.sku}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">{order.bom.name}</td>
                    <td className="p-4">
                      {order.machine ? (
                        <div className="font-medium text-foreground">
                          {order.machine.name}
                          <span className="text-[9px] text-muted-foreground font-mono block mt-0.5">{order.machine.code}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Manual Assembly</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-foreground">{order.quantity} pcs</td>
                    <td className="p-4 font-medium text-foreground">${order.cost.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold ${
                        order.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : order.status === 'InProgress'
                          ? 'bg-sky-500/10 text-sky-500 animate-pulse'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {order.status === 'InProgress' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Completed')}
                            className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold hover:underline"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Yield Completed
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                            className="flex items-center gap-1 text-[10px] text-red-500 font-bold hover:underline"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Terminate
                          </button>
                        </div>
                      )}
                      {order.status === 'Completed' && (
                        <span className="text-muted-foreground text-[10px]">
                          Finished at {new Date(order.endDate!).toLocaleDateString()}
                        </span>
                      )}
                      {order.status === 'Cancelled' && (
                        <span className="text-red-400 text-[10px]">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Recipes / BOM catalog */
        data?.boms.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
            No Bill of Materials recipes configured. Click Create BOM Recipe to start.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {data?.boms.map((bom) => (
              <div key={bom.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start border-b border-border pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">{bom.name}</h3>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      For product SKU: {bom.product.sku} ({bom.product.name})
                    </div>
                  </div>
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                    Ver: {bom.version}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Component Raw Materials
                  </div>
                  <div className="space-y-1.5">
                    {bom.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs border border-border/40 rounded-xl px-3 py-2 bg-secondary/10">
                        <div>
                          <div className="font-semibold">{item.rawMaterial.name}</div>
                          <div className="text-[9px] text-muted-foreground mt-0.5 font-mono">{item.rawMaterial.sku}</div>
                        </div>
                        <div className="font-bold text-foreground">
                          {item.quantity} {item.rawMaterial.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Launch Production Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-sky-400" /> Start Production run
              </span>
              <button onClick={() => setShowOrderModal(false)} className="text-muted-foreground hover:text-foreground text-xs">
                Cancel
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleStartOrder} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold">Select BOM Recipe *</label>
                <select
                  value={bomId}
                  onChange={(e) => setBomId(e.target.value)}
                  className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
                >
                  {data?.boms.map((bom) => (
                    <option key={bom.id} value={bom.id}>
                      {bom.name} ({bom.product.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Allocated Machine (Optional)</label>
                  <select
                    value={machineId}
                    onChange={(e) => setMachineId(e.target.value)}
                    className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
                  >
                    <option value="">Manual / Workbench</option>
                    {machines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Batch Yield Quantity *</label>
                  <input
                    type="number"
                    required
                    value={orderQty}
                    onChange={(e) => setOrderQty(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                <div className="text-[10px] text-muted-foreground leading-relaxed">
                  Launching this order run will immediately perform database stock validations and consume components from the Central Warehouse inventory log.
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[0.98] hover:opacity-90 transition-all cursor-pointer"
              >
                Allocate Materials & Launch Run
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create BOM Modal */}
      {showBOMModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" /> Create BOM Recipe
              </span>
              <button onClick={() => setShowBOMModal(false)} className="text-muted-foreground hover:text-foreground text-xs">
                Cancel
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateBOM} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">BOM Recipe Name *</label>
                  <input
                    type="text"
                    required
                    value={bomName}
                    onChange={(e) => setBomName(e.target.value)}
                    placeholder="e.g. Thermostat Standard v1"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Finished Product Target *</label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic BOM list */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                    Required Recipe Components
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBOMComponent}
                    className="text-xs text-sky-400 font-semibold hover:underline"
                  >
                    + Add Component
                  </button>
                </div>

                <div className="space-y-2.5">
                  {selectedComponents.map((comp, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select
                        value={comp.rawMaterialId}
                        onChange={(e) => handleBOMComponentChange(idx, 'rawMaterialId', e.target.value)}
                        className="flex-1 h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
                      >
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.sku} - {m.name} ({m.unit})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        step="0.001"
                        required
                        value={comp.quantity}
                        onChange={(e) => handleBOMComponentChange(idx, 'quantity', e.target.value)}
                        placeholder="Quantity"
                        className="w-24 h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                      />

                      {selectedComponents.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBOMComponent(idx)}
                          className="text-red-400 font-bold hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[0.98] hover:opacity-90 transition-all cursor-pointer"
              >
                Register BOM Recipe
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
