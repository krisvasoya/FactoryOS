'use client';

import React from 'react';
import { Plus, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import { TableSkeleton } from '@/components/skeleton';
import { useFinance } from '@/features/finance/hooks/useFinance';
import { InvoiceTable } from '@/features/finance/components/InvoiceTable';
import { ExpenseTable } from '@/features/finance/components/ExpenseTable';
import { PaymentsTable } from '@/features/finance/components/PaymentsTable';
import { InvoiceModal } from '@/features/finance/components/InvoiceModal';
import { ExpenseModal } from '@/features/finance/components/ExpenseModal';
import { PaymentModal } from '@/features/finance/components/PaymentModal';
import { GstCalculator } from '@/features/finance/components/GstCalculator';

export default function FinancePage() {
  const {
    financeData,
    loading,
    activeTab,
    setActiveTab,
    showInvoiceModal,
    setShowInvoiceModal,
    showExpenseModal,
    setShowExpenseModal,
    showPaymentModal,
    setShowPaymentModal,
    error,
    customers,
    revenueTotal,
    expenseTotal,
    cashInflow,
    netProfit,
    gst,
    invoiceForm,
    expenseForm,
    paymentForm,
    handlePrintInvoice,
  } = useFinance();

  if (loading) {
    return <TableSkeleton />;
  }

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
            className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2.5 text-xs shadow-md hover:scale-[1.02] hover:opacity-90 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Finance totals Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Ledger Invoiced</span>
            <div className="text-base font-bold">₹{revenueTotal.toFixed(2)}</div>
          </div>
          <TrendingUp className="h-4 w-4 text-sky-400" />
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Operational Expenses</span>
            <div className="text-base font-bold text-red-500">₹{expenseTotal.toFixed(2)}</div>
          </div>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Payments Received</span>
            <div className="text-base font-bold text-emerald-500">₹{cashInflow.toFixed(2)}</div>
          </div>
          <IndianRupee className="h-4 w-4 text-emerald-500" />
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Estimated Profit</span>
            <div className="text-base font-bold text-foreground">₹{netProfit.toFixed(2)}</div>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main List column */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'invoices' && (
            <InvoiceTable
              invoices={financeData?.invoices || []}
              onRecordPayment={(inv) => {
                paymentForm.setPaymentInvoiceId(inv.id);
                paymentForm.setPaymentAmount(inv.totalAmount.toString());
                setShowPaymentModal(true);
              }}
              onPrintLayout={handlePrintInvoice}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseTable expenses={financeData?.expenses || []} />
          )}

          {activeTab === 'ledger' && (
            <PaymentsTable payments={financeData?.payments || []} />
          )}
        </div>

        {/* Right column: Interactive GST Tax Calculator */}
        <div className="space-y-4">
          <GstCalculator
            gstAmountInput={gst.gstAmountInput}
            setGstAmountInput={gst.setGstAmountInput}
            gstRate={gst.gstRate}
            setGstRate={gst.setGstRate}
            calculatedGST={gst.calculatedGST}
            onCalculate={gst.handleCalculateGST}
          />
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <InvoiceModal
          onClose={() => setShowInvoiceModal(false)}
          onSubmit={invoiceForm.handleCreateInvoice}
          error={error}
          customers={customers}
          form={invoiceForm}
        />
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <ExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSubmit={expenseForm.handleCreateExpense}
          error={error}
          form={expenseForm}
        />
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSubmit={paymentForm.handleRecordPayment}
          error={error}
          form={paymentForm}
        />
      )}
    </div>
  );
}
