'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, UserPlus, Building, Info, Palette, FileText, Check, Layout, LogOut } from 'lucide-react';
import { TableSkeleton } from '@/components/skeleton';

interface CompanyInfo {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  gstNumber: string | null;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [error, setError] = useState('');

  // Form Invite State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Viewer');
  const [invitePassword, setInvitePassword] = useState('password123'); // Default simple password

  // Company Details Form State
  const [compName, setCompName] = useState('');
  const [compPhone, setCompPhone] = useState('');
  const [compAddress, setCompAddress] = useState('');
  const [compGst, setCompGst] = useState('');

  // Customizable Invoice Layout State
  const [invoiceTitle, setInvoiceTitle] = useState('TAX INVOICE');
  const [themeColor, setThemeColor] = useState('#6366f1'); // Default Indigo
  const [showSku, setShowSku] = useState(true);
  const [showGst, setShowGst] = useState(true);
  const [showDueDate, setShowDueDate] = useState(true);
  const [terms, setTerms] = useState('Goods once sold are non-refundable. Please make payments via bank transfer.');
  const [bankDetails, setBankDetails] = useState('Bank Name: HDFC Bank, A/C: 50200012345678, IFSC: HDFC0001234');
  const [savingLayout, setSavingLayout] = useState(false);

  // Preset Colors
  const colorPresets = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Sky Blue', value: '#0284c7' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Violet', value: '#7c3aed' },
    { name: 'Slate', value: '#475569' },
  ];

  async function loadSettings() {
    try {
      const res = await fetch('/api/v1/settings');
      if (res.ok) {
        const data = await res.json();
        setCompany(data.company);
        setCompName(data.company.name);
        setCompPhone(data.company.phone || '');
        setCompAddress(data.company.address || '');
        setCompGst(data.company.gstNumber || '');

        setMembers(data.members);

        // Load Invoice Layout Settings
        const layoutSetting = data.settings?.find((s: { key: string; value: string }) => s.key === 'billing_template_layout');
        if (layoutSetting) {
          try {
            const layout = JSON.parse(layoutSetting.value);
            setInvoiceTitle(layout.title || 'TAX INVOICE');
            setThemeColor(layout.themeColor || '#6366f1');
            setShowSku(layout.showSku ?? true);
            setShowGst(layout.showGst ?? true);
            setShowDueDate(layout.showDueDate ?? true);
            setTerms(layout.terms || 'Goods once sold are non-refundable. Please make payments via bank transfer.');
            setBankDetails(layout.bankDetails || 'Bank Name: HDFC Bank, A/C: 50200012345678, IFSC: HDFC0001234');
          } catch (e) {
            console.error('Failed to parse invoice layout', e);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      loadSettings();
    }, 0);
  }, []);

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/v1/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateCompany',
          name: compName,
          phone: compPhone,
          address: compAddress,
          gstNumber: compGst,
        }),
      });

      if (res.ok) {
        alert('Company settings updated successfully.');
        loadSettings();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update company.');
      }
    } catch {
      setError('Connection failure.');
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/v1/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'inviteUser',
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
          password: invitePassword,
        }),
      });

      if (res.ok) {
        setShowInviteModal(false);
        setInviteName('');
        setInviteEmail('');
        setInvitePassword('password123');
        loadSettings();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to onboard team member.');
      }
    } catch {
      setError('Connection error.');
    }
  };

  const handleSaveInvoiceLayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLayout(true);
    setError('');

    try {
      const res = await fetch('/api/v1/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateInvoiceLayout',
          layout: {
            title: invoiceTitle,
            themeColor,
            showSku,
            showGst,
            showDueDate,
            terms,
            bankDetails,
          },
        }),
      });

      if (res.ok) {
        alert('Invoice layout template saved successfully.');
        loadSettings();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save invoice layout.');
      }
    } catch {
      setError('Connection error.');
    } finally {
      setSavingLayout(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth', { method: 'DELETE' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">System Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure corporate tenant parameters, GST identifiers, and customize user permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Company configurations */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-3">
              <Building className="h-4 w-4 text-sky-400" /> Tenant Company Profile
            </h3>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateCompany} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Registered Company Name *</label>
                  <input
                    type="text"
                    required
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">GST / Tax Identifier Number</label>
                  <input
                    type="text"
                    value={compGst}
                    onChange={(e) => setCompGst(e.target.value)}
                    placeholder="e.g. 29AAAAA1111A1Z1"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Corporate Contact Phone</label>
                  <input
                    type="text"
                    value={compPhone}
                    onChange={(e) => setCompPhone(e.target.value)}
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Tenant ID (Isolated context UUID)</label>
                  <input
                    type="text"
                    disabled
                    value={company?.email || 'SYSTEM_MAPPED'}
                    className="w-full h-9 border border-border rounded-xl bg-secondary/10 px-3 text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Corporate Address</label>
                <input
                  type="text"
                  value={compAddress}
                  onChange={(e) => setCompAddress(e.target.value)}
                  className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-secondary px-4 py-2.5 font-bold hover:bg-secondary/70 transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </div>

          {/* Members invite panel */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 self-start">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-indigo-400" /> Member Privileges
              </h3>
              <button
                onClick={() => setShowInviteModal(true)}
                className="text-xs text-sky-400 font-semibold hover:underline"
              >
                + Add User
              </button>
            </div>

            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {members.map((member) => (
                <div key={member.id} className="flex justify-between items-center text-xs border border-border/40 rounded-xl px-3 py-2.5 bg-secondary/10">
                  <div>
                    <div className="font-semibold">{member.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{member.email}</div>
                  </div>
                  <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold ${
                    member.role === 'Owner'
                      ? 'bg-gradient-to-tr from-sky-400 to-indigo-600 text-white'
                      : member.role === 'Production'
                      ? 'bg-sky-500/10 text-sky-500'
                      : member.role === 'Accountant'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* Invoice Customization Section */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layout className="h-4 w-4 text-sky-400" /> Customizable Bill Format Designer
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Customize company billing layout, accent themes, table fields, bank details, and print options.
            </p>
          </div>
          <button
            onClick={handleSaveInvoiceLayout}
            disabled={savingLayout}
            className="flex items-center gap-1.5 self-end sm:self-center rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2 text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
          >
            {savingLayout ? 'Saving...' : 'Save Template'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Controls Form */}
          <div className="lg:col-span-2 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Invoice Document Title</label>
              <input
                type="text"
                value={invoiceTitle}
                onChange={(e) => setInvoiceTitle(e.target.value)}
                placeholder="e.g. TAX INVOICE"
                className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
              />
            </div>

            {/* Accent Theme Color */}
            <div className="space-y-2">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <Palette className="h-3.5 w-3.5 text-indigo-400" /> Theme Accent Color
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setThemeColor(preset.value)}
                    className="h-6 w-6 rounded-full border border-border flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: preset.value }}
                    title={preset.name}
                  >
                    {themeColor === preset.value && (
                      <Check className="h-3.5 w-3.5 text-white drop-shadow" />
                    )}
                  </button>
                ))}
                <div className="flex items-center gap-1.5 ml-2 border border-border rounded-xl px-2 py-0.5 bg-secondary/10">
                  <span className="text-[10px] text-muted-foreground font-mono">Hex:</span>
                  <input
                    type="text"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-12 h-6 border-none bg-transparent focus:outline-none text-[10px] font-mono"
                  />
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-4 h-4 p-0 border-none bg-transparent cursor-pointer rounded"
                  />
                </div>
              </div>
            </div>

            {/* Field Visibility Toggles */}
            <div className="space-y-2">
              <label className="font-semibold text-muted-foreground">Table Columns & Parameters</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-secondary/10 border border-border/40 rounded-xl p-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSku}
                    onChange={(e) => setShowSku(e.target.checked)}
                    className="rounded border-border bg-secondary/20 text-primary focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Show SKU</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGst}
                    onChange={(e) => setShowGst(e.target.checked)}
                    className="rounded border-border bg-secondary/20 text-primary focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Show GST %</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDueDate}
                    onChange={(e) => setShowDueDate(e.target.checked)}
                    className="rounded border-border bg-secondary/20 text-primary focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Show Due Date</span>
                </label>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-sky-400" /> Default Terms & Conditions
              </label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={3}
                className="w-full border border-border rounded-xl bg-secondary/20 p-2.5 focus:outline-none resize-none leading-relaxed text-[11px]"
              />
            </div>

            {/* Payment Bank Details */}
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-emerald-400" /> Bank & Payment Coordinates
              </label>
              <textarea
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                rows={3}
                className="w-full border border-border rounded-xl bg-secondary/20 p-2.5 focus:outline-none resize-none leading-relaxed text-[11px]"
              />
            </div>
          </div>

          {/* Real-time Document Sheet Preview */}
          <div className="lg:col-span-3 border border-border bg-secondary/5 rounded-2xl p-4 flex flex-col justify-start space-y-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Live Preview (A4 Simulative Ratio)</span>
            
            <div className="bg-white text-slate-800 p-6 rounded-xl border border-slate-200 shadow-lg text-[10px] font-sans space-y-6">
              {/* Preview Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-sm font-bold tracking-tight uppercase transition-colors" style={{ color: themeColor }}>
                    {invoiceTitle}
                  </h4>
                  <div className="text-[9px] text-slate-400 font-mono mt-1">#INV-2026-0001</div>
                </div>
                <div className="text-right text-[9px] text-slate-500 space-y-0.5">
                  <div className="font-bold text-slate-700">{compName || 'Your Company Name Ltd.'}</div>
                  <div>GSTIN: {compGst || 'NOT_DECLARED'}</div>
                  <div className="max-w-[180px] text-[8px] truncate">{compAddress || 'Corporate Headquarters Address'}</div>
                </div>
              </div>

              {/* Client metadata */}
              <div className="grid grid-cols-2 gap-4 text-[9px] text-slate-600 bg-slate-50/50 p-2 rounded-lg">
                <div>
                  <div className="text-[8px] uppercase font-bold text-slate-400">Bill To:</div>
                  <div className="font-semibold text-slate-700">Apex Industrial Solutions</div>
                  <div>Warehouse Block 4, Industrial Area Phase II</div>
                </div>
                <div className="text-right space-y-1">
                  <div>
                    <span className="font-medium text-slate-400">Invoice Date:</span> <span className="font-semibold text-slate-700">June 22, 2026</span>
                  </div>
                  {showDueDate && (
                    <div>
                      <span className="font-medium text-slate-400">Due Date:</span> <span className="font-semibold text-red-600">July 07, 2026</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-hidden border border-slate-100 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-white text-[9px] font-semibold" style={{ backgroundColor: themeColor }}>
                      <th className="p-2">Item Description</th>
                      {showSku && <th className="p-2">SKU</th>}
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2 text-right">Rate</th>
                      {showGst && <th className="p-2 text-right">GST</th>}
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[8.5px]">
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2 font-medium text-slate-700">Premium PCB Assembly (RoHS Compliant)</td>
                      {showSku && <td className="p-2 font-mono text-slate-500">PCB-ASM-001</td>}
                      <td className="p-2 text-right">5</td>
                      <td className="p-2 text-right">₹1,200.00</td>
                      {showGst && <td className="p-2 text-right">18%</td>}
                      <td className="p-2 text-right font-semibold">₹6,000.00</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2 font-medium text-slate-700">Industrial Copper Wire Harness (Heavy-Duty)</td>
                      {showSku && <td className="p-2 font-mono text-slate-500">CBL-HAR-092</td>}
                      <td className="p-2 text-right">10</td>
                      <td className="p-2 text-right">₹350.00</td>
                      {showGst && <td className="p-2 text-right">18%</td>}
                      <td className="p-2 text-right font-semibold">₹3,500.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals computation block */}
              <div className="flex justify-between items-start pt-2">
                <div className="text-[7.5px] text-slate-400 italic max-w-[200px]">
                  * Amounts are calculated strictly based on current tax regulations.
                </div>
                <div className="w-48 text-[9px] space-y-1.5 border-t border-slate-100 pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pre-tax Subtotal:</span>
                    <span className="font-semibold text-slate-700">₹9,500.00</span>
                  </div>
                  {showGst && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total GST tax (18%):</span>
                      <span className="font-semibold text-slate-700">₹1,710.00</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-slate-200">
                    <span className="text-slate-700">Total Due:</span>
                    <span style={{ color: themeColor }}>₹{showGst ? '11,210.00' : '9,500.00'}</span>
                  </div>
                </div>
              </div>

              {/* Details & Signature */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-[8px] text-slate-500">
                <div className="space-y-2">
                  <div>
                    <div className="font-bold text-slate-600 uppercase text-[7px] tracking-wide">Payment Coordinates:</div>
                    <div className="leading-relaxed whitespace-pre-line mt-0.5">{bankDetails}</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-600 uppercase text-[7px] tracking-wide">Terms & Conditions:</div>
                    <div className="leading-relaxed whitespace-pre-line mt-0.5">{terms}</div>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end h-full">
                  <div className="text-right">
                    <span className="text-[7px] text-slate-400">Authorized Signature:</span>
                  </div>
                  <div className="w-24 border-b border-slate-400 h-6"></div>
                  <div className="text-right text-[7px] text-slate-400 mt-1">For {compName || 'Your Company Name Ltd.'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-sky-400" /> Onboard Staff Member
              </span>
              <button onClick={() => setShowInviteModal(false)} className="text-muted-foreground hover:text-foreground text-xs">
                Cancel
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleInviteUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Vikram Singh"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Default Password *</label>
                  <input
                    type="password"
                    required
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    placeholder="password123"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="vikram@apexmfg.com"
                  className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Privilege Authorization Role *</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
                >
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="Manager">Manager</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Production">Production Line Operator</option>
                  <option value="Warehouse">Warehouse Manager</option>
                  <option value="Sales">Sales Manager</option>
                  <option value="Viewer">Viewer (Read Only)</option>
                </select>
              </div>

              <div className="rounded-xl border border-border bg-secondary/15 p-3 flex gap-2">
                <Info className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-[10px] text-muted-foreground leading-relaxed">
                  Invited members belong strictly to your tenant sandbox and can only access materials or financials mapping to your <strong>companyId</strong>.
                </span>
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[0.98] hover:opacity-90 transition-all cursor-pointer"
              >
                Register Staff User
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Danger Zone — Sign Out */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5 border-b border-red-500/20 pb-3">
          <LogOut className="h-4 w-4" /> Session & Security
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Sign out of your account</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This will clear your session token and return you to the login portal.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-400 hover:scale-[0.98] transition-all duration-200 shrink-0"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

    </div>
  );
}
