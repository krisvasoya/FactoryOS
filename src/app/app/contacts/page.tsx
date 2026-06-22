'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Star, CreditCard, Phone, Mail, MapPin, Building2, X, ChevronRight, Package, ShoppingBag } from 'lucide-react';
import { TableSkeleton } from '@/components/skeleton';

interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  rating: number;
  purchaseOrders: { id: string }[];
}

interface Customer {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  creditLimit: number;
  salesOrders: { id: string }[];
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3 w-3 ${s <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
      <span className="text-[10px] text-muted-foreground ml-1">{value.toFixed(1)}</span>
    </div>
  );
}

export default function ContactsPage() {
  const [data, setData] = useState<{ suppliers: Supplier[]; customers: Customer[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'suppliers' | 'customers'>('suppliers');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'supplier' | 'customer'>('supplier');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Form fields
  const [form, setForm] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    creditLimit: '',
    rating: '5',
  });

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/contacts');
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/v1/contacts')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (active && d) setData(d); })
      .catch(console.error)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [load]);

  const openModal = (type: 'supplier' | 'customer') => {
    setModalType(type);
    setForm({ name: '', contactName: '', email: '', phone: '', address: '', creditLimit: '', rating: '5' });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/v1/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: modalType, ...form }),
      });
      if (res.ok) {
        setShowModal(false);
        load();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to save');
      }
    } catch {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <TableSkeleton />;

  const suppliers = data?.suppliers ?? [];
  const customers = data?.customers ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-400" />
            Contacts
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your Suppliers and Buyers. Track orders, credit limits, and ratings.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openModal('supplier')}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-secondary/40 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Supplier
          </button>
          <button
            onClick={() => openModal('customer')}
            className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2.5 text-xs shadow-md hover:scale-[1.02] hover:opacity-90 transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Buyer
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Suppliers', value: suppliers.length, icon: Package, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Total Buyers', value: customers.length, icon: ShoppingBag, color: 'text-sky-400', bg: 'bg-sky-500/10' },
          { label: 'Active Purchase Orders', value: suppliers.reduce((s, x) => s + x.purchaseOrders.length, 0), icon: ChevronRight, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Active Sales Orders', value: customers.reduce((s, x) => s + x.salesOrders.length, 0), icon: ChevronRight, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
            <div className={`rounded-xl p-2 ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {(['suppliers', 'customers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold transition-all capitalize ${
              activeTab === tab
                ? 'text-primary dark:text-sky-400 border-b-2 border-primary dark:border-sky-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'suppliers' ? `Suppliers (${suppliers.length})` : `Buyers / Customers (${customers.length})`}
          </button>
        ))}
      </div>

      {/* Suppliers Grid */}
      {activeTab === 'suppliers' && (
        suppliers.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
            No suppliers yet. Click <span className="font-bold text-foreground">Add Supplier</span> to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {suppliers.map((s) => (
              <div key={s.id} className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:shadow-md hover:border-violet-500/30 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold text-sm">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{s.name}</div>
                      {s.contactName && (
                        <div className="text-[10px] text-muted-foreground">{s.contactName}</div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-violet-500/10 text-violet-400 rounded-lg px-2 py-0.5">
                    {s.purchaseOrders.length} POs
                  </span>
                </div>

                <StarRating value={s.rating} />

                <div className="space-y-1.5 text-[11px] text-muted-foreground">
                  {s.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                  {s.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{s.phone}</span>
                    </div>
                  )}
                  {s.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{s.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Customers Grid */}
      {activeTab === 'customers' && (
        customers.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
            No buyers yet. Click <span className="font-bold text-foreground">Add Buyer</span> to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {customers.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:shadow-md hover:border-sky-500/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 font-bold text-sm">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{c.name}</div>
                      {c.contactName && (
                        <div className="text-[10px] text-muted-foreground">{c.contactName}</div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-sky-500/10 text-sky-400 rounded-lg px-2 py-0.5">
                    {c.salesOrders.length} SOs
                  </span>
                </div>

                {/* Credit Limit bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground flex items-center gap-1"><CreditCard className="h-2.5 w-2.5" /> Credit Limit</span>
                    <span className="font-bold text-foreground">₹{c.creditLimit.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-sky-500 to-indigo-500"
                      style={{ width: c.creditLimit > 0 ? `${Math.min((c.creditLimit / 500000) * 100, 100)}%` : '4%' }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-muted-foreground">
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Add Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                {modalType === 'supplier' ? (
                  <><Building2 className="h-4 w-4 text-violet-400" /> Add New Supplier</>
                ) : (
                  <><ShoppingBag className="h-4 w-4 text-sky-400" /> Add New Buyer</>
                )}
              </span>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold">{modalType === 'supplier' ? 'Company / Supplier Name' : 'Buyer / Company Name'} *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={modalType === 'supplier' ? 'e.g. Acme Steels Ltd.' : 'e.g. TechCorp Industries'}
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Contact Person</label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    placeholder="Full name"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 99999 00000"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-semibold">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="contact@company.com"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-semibold">Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="City, State, Country"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>

                {modalType === 'supplier' && (
                  <div className="col-span-2 space-y-1">
                    <label className="font-semibold">Supplier Rating (1–5)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="0.5"
                        value={form.rating}
                        onChange={(e) => setForm({ ...form, rating: e.target.value })}
                        className="flex-1 accent-amber-400"
                      />
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="font-bold w-6">{form.rating}</span>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'customer' && (
                  <div className="col-span-2 space-y-1">
                    <label className="font-semibold">Credit Limit (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.creditLimit}
                      onChange={(e) => setForm({ ...form, creditLimit: e.target.value })}
                      placeholder="e.g. 100000"
                      className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[0.98] hover:opacity-90 transition-all cursor-pointer disabled:opacity-60"
              >
                {saving ? 'Saving…' : modalType === 'supplier' ? 'Add Supplier' : 'Add Buyer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
