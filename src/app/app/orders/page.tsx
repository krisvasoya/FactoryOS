'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, X, TrendingUp, TrendingDown, Package, AlertTriangle } from 'lucide-react';
import { TableSkeleton } from '@/components/skeleton';

interface RawMaterial { id: string; name: string; sku: string; unit: string }
interface Product { id: string; name: string; sku: string; price: number }
interface Supplier { id: string; name: string }
interface Customer { id: string; name: string }

interface PurchaseOrderItem {
  id: string;
  quantity: number;
  unitCost: number;
  rawMaterial: RawMaterial;
}

interface SalesOrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: Product;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: string;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  supplier: Supplier;
  items: PurchaseOrderItem[];
}

interface SalesOrder {
  id: string;
  soNumber: string;
  status: string;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  customer: Customer;
  items: SalesOrderItem[];
}

const PO_STATUSES = ['Draft', 'Ordered', 'Received', 'Cancelled'];
const SO_STATUSES = ['Draft', 'Confirmed', 'Shipped', 'Cancelled'];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Draft: 'bg-secondary text-muted-foreground',
    Ordered: 'bg-sky-500/10 text-sky-500',
    Received: 'bg-emerald-500/10 text-emerald-500',
    Confirmed: 'bg-indigo-500/10 text-indigo-500',
    Shipped: 'bg-emerald-500/10 text-emerald-500',
    Cancelled: 'bg-red-500/10 text-red-500',
  };
  return (
    <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold ${map[status] ?? 'bg-secondary text-muted-foreground'}`}>
      {status}
    </span>
  );
}

export default function OrdersPage() {
  const [data, setData] = useState<{ purchaseOrders: PurchaseOrder[]; salesOrders: SalesOrder[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'purchase' | 'sales'>('purchase');

  // For new order modals
  const [showPOModal, setShowPOModal] = useState(false);
  const [showSOModal, setShowSOModal] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Reference data
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // PO form
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poNotes, setPoNotes] = useState('');
  const [poItems, setPoItems] = useState([{ rawMaterialId: '', quantity: '', unitCost: '' }]);

  // SO form
  const [soCustomerId, setSoCustomerId] = useState('');
  const [soNotes, setSoNotes] = useState('');
  const [soItems, setSoItems] = useState([{ productId: '', quantity: '', unitPrice: '' }]);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/orders');
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const [ordersRes, contactsRes, matsRes, prodsRes] = await Promise.all([
          fetch('/api/v1/orders'),
          fetch('/api/v1/contacts'),
          fetch('/api/v1/raw-materials'),
          fetch('/api/v1/products'),
        ]);
        if (!active) return;
        if (ordersRes.ok) setData(await ordersRes.json());
        if (contactsRes.ok) {
          const c = await contactsRes.json();
          setSuppliers(c.suppliers ?? []);
          setCustomers(c.customers ?? []);
          if (c.suppliers?.length) setPoSupplierId(c.suppliers[0].id);
          if (c.customers?.length) setSoCustomerId(c.customers[0].id);
        }
        if (matsRes.ok) {
          const m = await matsRes.json();
          setRawMaterials(m);
          if (m.length) setPoItems([{ rawMaterialId: m[0].id, quantity: '', unitCost: '' }]);
        }
        if (prodsRes.ok) {
          const p = await prodsRes.json();
          setProducts(p);
          if (p.length) setSoItems([{ productId: p[0].id, quantity: '', unitPrice: String(p[0].price ?? '') }]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    }
    init();
    return () => { active = false; };
  }, []);

  const updateOrderStatus = async (orderId: string, orderType: 'purchase' | 'sales', status: string) => {
    try {
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateOrderStatus', orderId, orderType, status }),
      });
      if (res.ok) load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createPurchaseOrder',
          supplierId: poSupplierId,
          notes: poNotes,
          items: poItems.filter((i) => i.rawMaterialId && i.quantity),
        }),
      });
      if (res.ok) {
        setShowPOModal(false);
        setPoNotes('');
        setPoItems([{ rawMaterialId: rawMaterials[0]?.id ?? '', quantity: '', unitCost: '' }]);
        load();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to create purchase order');
      }
    } catch {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSO = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createSalesOrder',
          customerId: soCustomerId,
          notes: soNotes,
          items: soItems.filter((i) => i.productId && i.quantity),
        }),
      });
      if (res.ok) {
        setShowSOModal(false);
        setSoNotes('');
        setSoItems([{ productId: products[0]?.id ?? '', quantity: '', unitPrice: String(products[0]?.price ?? '') }]);
        load();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to create sales order');
      }
    } catch {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <TableSkeleton />;

  const pos = data?.purchaseOrders ?? [];
  const sos = data?.salesOrders ?? [];
  const totalPOValue = pos.reduce((s, o) => s + o.totalAmount, 0);
  const totalSOValue = sos.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-sky-400" />
            Orders
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create and manage Purchase Orders from suppliers and Sales Orders for buyers.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setError(''); setShowPOModal(true); }}
            disabled={suppliers.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-secondary/40 transition-colors cursor-pointer disabled:opacity-50"
          >
            <TrendingDown className="h-3.5 w-3.5 text-violet-400" />
            New Purchase Order
          </button>
          <button
            onClick={() => { setError(''); setShowSOModal(true); }}
            disabled={customers.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2.5 text-xs shadow-md hover:scale-[1.02] hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            New Sales Order
          </button>
        </div>
      </div>

      {(suppliers.length === 0 || customers.length === 0) && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex gap-2 text-xs">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <span className="text-muted-foreground">
            You need to add <strong className="text-foreground">Contacts</strong> (Suppliers & Buyers) before creating orders.{' '}
            <a href="/app/contacts" className="text-primary underline font-bold">Go to Contacts →</a>
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Purchase Orders', value: pos.length, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Total PO Value', value: `₹${totalPOValue.toLocaleString()}`, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Sales Orders', value: sos.length, color: 'text-sky-400', bg: 'bg-sky-500/10' },
          { label: 'Total SO Value', value: `₹${totalSOValue.toLocaleString()}`, color: 'text-sky-400', bg: 'bg-sky-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
            <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {(['purchase', 'sales'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold transition-all ${
              activeTab === tab
                ? 'text-primary dark:text-sky-400 border-b-2 border-primary dark:border-sky-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'purchase' ? `Purchase Orders (${pos.length})` : `Sales Orders (${sos.length})`}
          </button>
        ))}
      </div>

      {/* Purchase Orders Table */}
      {activeTab === 'purchase' && (
        pos.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
            No purchase orders yet. Click <strong className="text-foreground">New Purchase Order</strong> to get started.
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/20 text-muted-foreground">
                  <th className="p-4 text-left font-semibold">PO Number</th>
                  <th className="p-4 text-left font-semibold">Supplier</th>
                  <th className="p-4 text-left font-semibold">Items</th>
                  <th className="p-4 text-left font-semibold">Total Value</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {pos.map((po) => (
                  <tr key={po.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4 font-bold font-mono text-foreground">{po.poNumber}</td>
                    <td className="p-4">
                      <div className="font-semibold">{po.supplier.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(po.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <div className="space-y-0.5">
                        {po.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-1">
                            <Package className="h-2.5 w-2.5 shrink-0" />
                            <span>{item.rawMaterial.name} × {item.quantity} {item.rawMaterial.unit}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-foreground">₹{po.totalAmount.toLocaleString()}</td>
                    <td className="p-4"><StatusBadge status={po.status} /></td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {PO_STATUSES.filter((s) => s !== po.status && s !== 'Cancelled').map((s) => (
                          <button
                            key={s}
                            onClick={() => updateOrderStatus(po.id, 'purchase', s)}
                            className="text-[10px] text-left text-sky-500 hover:underline font-semibold"
                          >
                            → Mark {s}
                          </button>
                        ))}
                        {po.status !== 'Cancelled' && po.status !== 'Received' && (
                          <button
                            onClick={() => updateOrderStatus(po.id, 'purchase', 'Cancelled')}
                            className="text-[10px] text-left text-red-500 hover:underline font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Sales Orders Table */}
      {activeTab === 'sales' && (
        sos.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
            No sales orders yet. Click <strong className="text-foreground">New Sales Order</strong> to get started.
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/20 text-muted-foreground">
                  <th className="p-4 text-left font-semibold">SO Number</th>
                  <th className="p-4 text-left font-semibold">Customer / Buyer</th>
                  <th className="p-4 text-left font-semibold">Items</th>
                  <th className="p-4 text-left font-semibold">Total Value</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sos.map((so) => (
                  <tr key={so.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4 font-bold font-mono text-foreground">{so.soNumber}</td>
                    <td className="p-4">
                      <div className="font-semibold">{so.customer.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(so.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <div className="space-y-0.5">
                        {so.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-1">
                            <Package className="h-2.5 w-2.5 shrink-0" />
                            <span>{item.product.name} × {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-foreground">₹{so.totalAmount.toLocaleString()}</td>
                    <td className="p-4"><StatusBadge status={so.status} /></td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {SO_STATUSES.filter((s) => s !== so.status && s !== 'Cancelled').map((s) => (
                          <button
                            key={s}
                            onClick={() => updateOrderStatus(so.id, 'sales', s)}
                            className="text-[10px] text-left text-sky-500 hover:underline font-semibold"
                          >
                            → Mark {s}
                          </button>
                        ))}
                        {so.status !== 'Cancelled' && so.status !== 'Shipped' && (
                          <button
                            onClick={() => updateOrderStatus(so.id, 'sales', 'Cancelled')}
                            className="text-[10px] text-left text-red-500 hover:underline font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── Purchase Order Modal ── */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-violet-400" /> New Purchase Order
              </span>
              <button onClick={() => setShowPOModal(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            {error && <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">{error}</div>}
            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold">Supplier *</label>
                <select
                  value={poSupplierId}
                  onChange={(e) => setPoSupplierId(e.target.value)}
                  className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Order Items</label>
                  <button
                    type="button"
                    onClick={() => setPoItems([...poItems, { rawMaterialId: rawMaterials[0]?.id ?? '', quantity: '', unitCost: '' }])}
                    className="text-xs text-sky-400 font-semibold hover:underline"
                  >
                    + Add Item
                  </button>
                </div>
                {poItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                    <select
                      value={item.rawMaterialId}
                      onChange={(e) => {
                        const next = [...poItems];
                        next[idx] = { ...next[idx], rawMaterialId: e.target.value };
                        setPoItems(next);
                      }}
                      className="col-span-2 h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
                    >
                      {rawMaterials.map((m) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                      ))}
                    </select>
                    <input
                      type="number" step="0.01" placeholder="Qty" required
                      value={item.quantity}
                      onChange={(e) => { const n = [...poItems]; n[idx] = { ...n[idx], quantity: e.target.value }; setPoItems(n); }}
                      className="col-span-1 h-9 border border-border rounded-xl bg-secondary/20 px-2 focus:outline-none"
                    />
                    <input
                      type="number" step="0.01" placeholder="₹/unit"
                      value={item.unitCost}
                      onChange={(e) => { const n = [...poItems]; n[idx] = { ...n[idx], unitCost: e.target.value }; setPoItems(n); }}
                      className="col-span-1 h-9 border border-border rounded-xl bg-secondary/20 px-2 focus:outline-none"
                    />
                    {poItems.length > 1 && (
                      <button type="button" onClick={() => setPoItems(poItems.filter((_, i) => i !== idx))} className="text-red-400 font-bold text-[10px]">✕</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Notes</label>
                <input
                  type="text" value={poNotes} onChange={(e) => setPoNotes(e.target.value)}
                  placeholder="Optional notes for this PO"
                  className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                />
              </div>

              <button
                type="submit" disabled={saving}
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-60"
              >
                {saving ? 'Creating…' : 'Create Purchase Order'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Sales Order Modal ── */}
      {showSOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-sky-400" /> New Sales Order
              </span>
              <button onClick={() => setShowSOModal(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            {error && <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">{error}</div>}
            <form onSubmit={handleCreateSO} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold">Buyer / Customer *</label>
                <select
                  value={soCustomerId}
                  onChange={(e) => setSoCustomerId(e.target.value)}
                  className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Order Items</label>
                  <button
                    type="button"
                    onClick={() => setSoItems([...soItems, { productId: products[0]?.id ?? '', quantity: '', unitPrice: String(products[0]?.price ?? '') }])}
                    className="text-xs text-sky-400 font-semibold hover:underline"
                  >
                    + Add Item
                  </button>
                </div>
                {soItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                    <select
                      value={item.productId}
                      onChange={(e) => {
                        const prod = products.find((p) => p.id === e.target.value);
                        const n = [...soItems];
                        n[idx] = { productId: e.target.value, quantity: n[idx].quantity, unitPrice: String(prod?.price ?? '') };
                        setSoItems(n);
                      }}
                      className="col-span-2 h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <input
                      type="number" step="1" placeholder="Qty" required
                      value={item.quantity}
                      onChange={(e) => { const n = [...soItems]; n[idx] = { ...n[idx], quantity: e.target.value }; setSoItems(n); }}
                      className="col-span-1 h-9 border border-border rounded-xl bg-secondary/20 px-2 focus:outline-none"
                    />
                    <input
                      type="number" step="0.01" placeholder="₹/unit"
                      value={item.unitPrice}
                      onChange={(e) => { const n = [...soItems]; n[idx] = { ...n[idx], unitPrice: e.target.value }; setSoItems(n); }}
                      className="col-span-1 h-9 border border-border rounded-xl bg-secondary/20 px-2 focus:outline-none"
                    />
                    {soItems.length > 1 && (
                      <button type="button" onClick={() => setSoItems(soItems.filter((_, i) => i !== idx))} className="text-red-400 font-bold text-[10px]">✕</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Notes</label>
                <input
                  type="text" value={soNotes} onChange={(e) => setSoNotes(e.target.value)}
                  placeholder="Optional notes for this SO"
                  className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                />
              </div>

              <button
                type="submit" disabled={saving}
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-60"
              >
                {saving ? 'Creating…' : 'Create Sales Order'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
