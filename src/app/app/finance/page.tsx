'use client';

import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Search, Percent, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  dueDate: string;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  customer: { name: string };
}

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  date: string;
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  createdAt: string;
  invoice: { invoiceNumber: string };
}

export default function FinancePage() {
  const [financeData, setFinanceData] = useState<{ invoices: Invoice[]; payments: Payment[]; expenses: Expense[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses' | 'ledger'>('invoices');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [error, setError] = useState('');

  // Selector databases
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Forms states
  const [customerId, setCustomerId] = useState('');
  const [subTotal, setSubTotal] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [expCategory, setExpCategory] = useState('Raw Materials');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const [paymentInvoiceId, setPaymentInvoiceId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank');
  const [paymentRef, setPaymentRef] = useState('');

  // GST Utility Interactive State
  const [gstAmountInput, setGstAmountInput] = useState('');
  const [gstRate, setGstRate] = useState('18');
  const [calculatedGST, setCalculatedGST] = useState<{ tax: number; total: number } | null>(null);

  async function loadFinance() {
    try {
      const res = await fetch('/api/v1/finance');
      if (res.ok) {
        const payload = await res.json();
        setFinanceData(payload);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadSelectors() {
    try {
      // Mock or fetch customers. For demo, we seed global customers or mock them here
      setCustomers([
        { id: 'cust-01', name: 'Global Electro-Distributors' },
        { id: 'cust-02', name: 'EcoHeat Systems Solutions' },
      ]);
      setCustomerId('cust-01');
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadFinance();
    loadSelectors();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/v1/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createInvoice',
          customerId,
          subTotal,
          dueDate,
        }),
      });

      if (res.ok) {
        setShowInvoiceModal(false);
        setSubTotal('');
        setDueDate('');
        loadFinance();
      } else {
        const errPayload = await res.json();
        setError(errPayload.error || 'Failed to create invoice.');
      }
    } catch (err) {
      setError('Connection failure.');
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/v1/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createExpense',
          category: expCategory,
          amount: expAmount,
          description: expDesc,
        }),
      });

      if (res.ok) {
        setShowExpenseModal(false);
        setExpAmount('');
        setExpDesc('');
        loadFinance();
      } else {
        const errPayload = await res.json();
        setError(errPayload.error || 'Failed to record expense.');
      }
    } catch (err) {
      setError('Connection failure.');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/v1/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recordPayment',
          invoiceId: paymentInvoiceId,
          amount: paymentAmount,
          method: paymentMethod,
          reference: paymentRef,
        }),
      });

      if (res.ok) {
        setShowPaymentModal(false);
        setPaymentAmount('');
        setPaymentRef('');
        loadFinance();
      } else {
        const errPayload = await res.json();
        setError(errPayload.error || 'Failed to record payment.');
      }
    } catch (err) {
      setError('Connection failure.');
    }
  };

  const handleCalculateGST = () => {
    const amt = parseFloat(gstAmountInput);
    const rate = parseFloat(gstRate);
    if (!isNaN(amt) && !isNaN(rate)) {
      const tax = (amt * rate) / 100;
      setCalculatedGST({
        tax,
        total: amt + tax,
      });
    }
  };

  // Summary Metrics calculations
  const revenueTotal = financeData?.invoices.reduce((acc, inv) => acc + inv.subTotal, 0) || 0;
  const expenseTotal = financeData?.expenses.reduce((acc, exp) => acc + exp.amount, 0) || 0;
  const cashInflow = financeData?.payments.reduce((acc, pay) => acc + pay.amount, 0) || 0;
  const netProfit = revenueTotal - expenseTotal;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Finance Ledger</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Supervise sales invoicing pipelines, audit material cash disbursements, and process GST accounts.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-secondary/40 transition-colors cursor-pointer"
          >
            <span>Log Expense</span>
          </button>
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 px-4 py-2.5 text-slate-950 font-bold text-xs shadow-md shadow-indigo-600/10 hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <Plus className="h-4 w-4 text-slate-950" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Finance totals Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Ledger Invoiced</span>
            <div className="text-base font-bold">${revenueTotal.toFixed(2)}</div>
          </div>
          <TrendingUp className="h-4 w-4 text-sky-400" />
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Operational Expenses</span>
            <div className="text-base font-bold text-red-500">${expenseTotal.toFixed(2)}</div>
          </div>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Payments Received</span>
            <div className="text-base font-bold text-emerald-500">${cashInflow.toFixed(2)}</div>
          </div>
          <DollarSign className="h-4 w-4 text-emerald-500" />
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Estimated Profit</span>
            <div className="text-base font-bold text-foreground">${netProfit.toFixed(2)}</div>
          </div>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'invoices'
              ? 'text-primary dark:text-sky-400 border-b-2 border-primary dark:border-sky-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Customer Invoices
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'expenses'
              ? 'text-primary dark:text-sky-400 border-b-2 border-primary dark:border-sky-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Expenses Ledger
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'ledger'
              ? 'text-primary dark:text-sky-400 border-b-2 border-primary dark:border-sky-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Payments Cashflow
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
          <Activity className="h-5 w-5 animate-spin mr-2 text-sky-400" />
          Loading finance ledgers...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main List column */}
          <div className="lg:col-span-2 space-y-4">
            {activeTab === 'invoices' && (
              financeData?.invoices.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
                  No invoices generated. Create an invoice to track billing details.
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-secondary/20 text-muted-foreground">
                        <th className="p-4 font-semibold">Invoice ID</th>
                        <th className="p-4 font-semibold">Client Name</th>
                        <th className="p-4 font-semibold">Due Date</th>
                        <th className="p-4 font-semibold">Amount (Subtotal)</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {financeData?.invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-4 font-mono font-medium">{inv.invoiceNumber}</td>
                          <td className="p-4 text-foreground font-semibold">{inv.customer?.name || 'Walk-in Client'}</td>
                          <td className="p-4 text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString()}</td>
                          <td className="p-4">
                            <div className="font-bold text-foreground">${inv.totalAmount.toFixed(2)}</div>
                            <div className="text-[9px] text-muted-foreground mt-0.5">GST Included: ${inv.taxAmount.toFixed(2)}</div>
                          </td>
                          <td className="p-4">
                            <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="p-4">
                            {inv.status === 'Unpaid' && (
                              <button
                                onClick={() => {
                                  setPaymentInvoiceId(inv.id);
                                  setPaymentAmount(inv.totalAmount.toString());
                                  setShowPaymentModal(true);
                                }}
                                className="text-[10px] text-sky-400 font-bold hover:underline"
                              >
                                Record Payment
                              </button>
                            )}
                            {inv.status === 'Paid' && (
                              <span className="text-[10px] text-muted-foreground">Cleared</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {activeTab === 'expenses' && (
              financeData?.expenses.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
                  No logged expenses.
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-secondary/20 text-muted-foreground">
                        <th className="p-4 font-semibold">Expense Date</th>
                        <th className="p-4 font-semibold">Ledger Category</th>
                        <th className="p-4 font-semibold">Description</th>
                        <th className="p-4 font-semibold">Outflow Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {financeData?.expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-4 text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className="rounded-lg bg-secondary px-2 py-0.5 text-[10px] font-bold text-primary">
                              {exp.category}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground leading-relaxed">{exp.description || 'N/A'}</td>
                          <td className="p-4 font-bold text-red-500">${exp.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {activeTab === 'ledger' && (
              financeData?.payments.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
                  No payment events processed.
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-secondary/20 text-muted-foreground">
                        <th className="p-4 font-semibold">Timestamp</th>
                        <th className="p-4 font-semibold">Invoice Ref</th>
                        <th className="p-4 font-semibold">Transfer Channel</th>
                        <th className="p-4 font-semibold">Transaction Code</th>
                        <th className="p-4 font-semibold">Cleared Inflow</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {financeData?.payments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-4 text-muted-foreground">{new Date(pay.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 font-mono font-medium">{pay.invoice?.invoiceNumber}</td>
                          <td className="p-4 text-foreground">{pay.method}</td>
                          <td className="p-4 font-mono text-muted-foreground">{pay.reference || 'N/A'}</td>
                          <td className="p-4 font-bold text-emerald-500">${pay.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>

          {/* Right column: Interactive GST Tax Calculator */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Percent className="h-4 w-4 text-sky-400" /> Inline GST Tax Calculator
              </h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Compute values quickly to calculate tax overhead.
              </p>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Pre-Tax Base Amount ($)</label>
                  <input
                    type="number"
                    value={gstAmountInput}
                    onChange={(e) => setGstAmountInput(e.target.value)}
                    placeholder="1000.00"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Tax GST Rate (%)</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                    className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
                  >
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST (Standard)</option>
                    <option value="28">28% GST</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleCalculateGST}
                  className="w-full h-9 rounded-xl bg-secondary text-primary font-bold hover:bg-secondary/70 transition-colors"
                >
                  Compute GST
                </button>

                {calculatedGST && (
                  <div className="rounded-xl border border-border bg-secondary/10 p-3 space-y-1.5 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Computed GST Tax:</span>
                      <span className="font-semibold text-foreground">${calculatedGST.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1.5 text-xs font-bold">
                      <span className="text-muted-foreground">Invoice Grand Total:</span>
                      <span className="text-primary">${calculatedGST.total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                <Receipt className="h-4 w-4 text-sky-400" /> Create Client Invoice
              </span>
              <button onClick={() => setShowInvoiceModal(false)} className="text-muted-foreground hover:text-foreground text-xs">
                Cancel
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold">Linked Customer Account *</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Pre-Tax Subtotal ($) *</label>
                  <input
                    type="number"
                    required
                    value={subTotal}
                    onChange={(e) => setSubTotal(e.target.value)}
                    placeholder="1000.00"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Invoice Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none text-[10px]"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-secondary/15 p-3 text-[10px] text-muted-foreground">
                Note: Creating this invoice automatically calculates the standard <strong>18% GST tax rate</strong>, adding it to the subtotal amount dynamically.
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 text-slate-950 font-bold hover:scale-[0.98] transition-transform cursor-pointer"
              >
                Issue Invoice & Log GST
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                <Receipt className="h-4 w-4 text-red-400" /> Log Factory Expense
              </span>
              <button onClick={() => setShowExpenseModal(false)} className="text-muted-foreground hover:text-foreground text-xs">
                Cancel
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Ledger Category *</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
                  >
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Salaries">Worker Salaries</option>
                    <option value="Utilities">Factory Utilities</option>
                    <option value="Maintenance">Machine Repair</option>
                    <option value="Other">Other Miscellaneous</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Cash Outflow Amount ($) *</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="250.00"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Description / Notes</label>
                <input
                  type="text"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="e.g. Solder paste purchase lot"
                  className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 text-slate-950 font-bold hover:scale-[0.98] transition-transform cursor-pointer"
              >
                Log Outflow Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-sky-400" /> Record Client Payment
              </span>
              <button onClick={() => setShowPaymentModal(false)} className="text-muted-foreground hover:text-foreground text-xs">
                Cancel
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Cleared Inflow Amount ($) *</label>
                  <input
                    type="number"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Transfer Channel *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
                  >
                    <option value="Bank">Bank Transfer</option>
                    <option value="Cash">Cash Ledger</option>
                    <option value="Card">Credit Card</option>
                    <option value="UPI">UPI Payment</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Transaction Reference ID</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. TXN-998822"
                  className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 text-slate-950 font-bold hover:scale-[0.98] transition-transform cursor-pointer"
              >
                Process Payment Inflow
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
