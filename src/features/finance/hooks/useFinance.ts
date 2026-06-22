'use client';

import { useState, useEffect } from 'react';

export interface Customer {
  id: string;
  name: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  dueDate: string;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  customer: { name: string };
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  date: string;
}

export interface Payment {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  createdAt: string;
  invoice: { invoiceNumber: string };
}

export function useFinance() {
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

  // Invoice formatting settings states
  const [companyInfo, setCompanyInfo] = useState<{
    name: string;
    phone: string | null;
    address: string | null;
    gstNumber: string | null;
  } | null>(null);
  const [invoiceLayout, setInvoiceLayout] = useState<{
    title: string;
    themeColor: string;
    showSku: boolean;
    showGst: boolean;
    showDueDate: boolean;
    terms: string;
    bankDetails: string;
  } | null>(null);

  async function loadFinance() {
    try {
      const res = await fetch('/api/v1/finance');
      if (res.ok) {
        const payload = await res.json();
        setFinanceData(payload);
        if (payload.customers) {
          setCustomers(payload.customers);
          if (payload.customers.length > 0) {
            setCustomerId(payload.customers[0].id);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadSelectors() {
    // Loaded dynamically via loadFinance
  }

  async function loadLayoutSettings() {
    try {
      const res = await fetch('/api/v1/settings');
      if (res.ok) {
        const data = await res.json();
        setCompanyInfo(data.company);
        const layoutSetting = data.settings?.find((s: { key: string; value: string }) => s.key === 'billing_template_layout');
        if (layoutSetting) {
          try {
            setInvoiceLayout(JSON.parse(layoutSetting.value));
          } catch (e) {
            console.error('Error parsing layout setting', e);
          }
        }
      }
    } catch (e) {
      console.error('Error loading settings', e);
    }
  }

  useEffect(() => {
    loadFinance();
    loadSelectors();
    loadLayoutSettings();
  }, []);

  const handlePrintInvoice = (inv: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker is active. Please enable pop-ups for this site.');
      return;
    }

    const title = invoiceLayout?.title || 'TAX INVOICE';
    const themeColor = invoiceLayout?.themeColor || '#6366f1';
    const showSku = invoiceLayout?.showSku ?? true;
    const showGst = invoiceLayout?.showGst ?? true;
    const showDueDate = invoiceLayout?.showDueDate ?? true;
    const terms = invoiceLayout?.terms || 'Goods once sold are non-refundable. Please make payments via bank transfer.';
    const bankDetails = invoiceLayout?.bankDetails || 'Bank Name: HDFC Bank, A/C: 50200012345678, IFSC: HDFC0001234';

    const compName = companyInfo?.name || 'Your Company Name Ltd.';
    const compGst = companyInfo?.gstNumber || 'N/A';
    const compAddress = companyInfo?.address || 'N/A';
    const compPhone = companyInfo?.phone || 'N/A';

    const clientName = inv.customer?.name || 'Walk-in Client';
    const invoiceNumber = inv.invoiceNumber;
    const invoiceDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const dueDateStr = new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const items = [
      {
        description: 'Industrial Contract Manufacturing - Batch Services',
        sku: 'MFG-SVC-081',
        qty: 1,
        rate: inv.subTotal,
        total: inv.subTotal
      }
    ];

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - ${invoiceNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
          body {
            font-family: 'Outfit', sans-serif;
            color: #334155;
            margin: 0;
            padding: 40px;
            font-size: 12px;
            line-height: 1.5;
            background: #ffffff;
          }
          .invoice-card {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid ${themeColor};
            padding-bottom: 24px;
            margin-bottom: 24px;
          }
          .header-left h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 700;
            color: ${themeColor};
            letter-spacing: -0.02em;
            text-transform: uppercase;
          }
          .header-left .inv-num {
            font-family: monospace;
            font-size: 13px;
            color: #64748b;
            margin-top: 4px;
          }
          .header-right {
            text-align: right;
          }
          .company-name {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 4px;
          }
          .company-details {
            color: #64748b;
            font-size: 11px;
            line-height: 1.4;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            background: #f8fafc;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
          }
          .meta-block-title {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 700;
            color: #94a3b8;
            letter-spacing: 0.05em;
            margin-bottom: 6px;
          }
          .client-name {
            font-size: 13px;
            font-weight: 600;
            color: #0f172a;
          }
          .client-details {
            color: #475569;
            font-size: 11px;
            margin-top: 2px;
          }
          .meta-dates {
            text-align: right;
            font-size: 11px;
            color: #475569;
          }
          .meta-dates div {
            margin-bottom: 4px;
          }
          .meta-dates span {
            font-weight: 600;
            color: #0f172a;
          }
          .due-date-alert {
            color: #e11d48 !important;
            font-weight: 700 !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
          }
          th {
            background-color: ${themeColor};
            color: #ffffff;
            font-weight: 600;
            text-align: left;
            padding: 10px 14px;
            font-size: 11px;
            text-transform: uppercase;
          }
          td {
            padding: 12px 14px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 11px;
          }
          tr:last-child td {
            border-bottom: none;
          }
          .text-right {
            text-align: right;
          }
          .sku-code {
            font-family: monospace;
            color: #64748b;
          }
          .totals-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
          }
          .totals-note {
            font-size: 10px;
            color: #94a3b8;
            font-style: italic;
            max-width: 400px;
          }
          .totals-table {
            width: 280px;
            margin-bottom: 0;
            border: none;
          }
          .totals-table td {
            padding: 6px 0;
            border-bottom: none;
            font-size: 12px;
          }
          .totals-table tr.grand-total td {
            font-size: 14px;
            font-weight: 700;
            color: ${themeColor};
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer-notes {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 24px;
            font-size: 10px;
            color: #64748b;
          }
          .notes-section h5 {
            font-size: 10px;
            font-weight: 700;
            color: #475569;
            margin: 0 0 6px 0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .notes-content {
            line-height: 1.5;
            white-space: pre-line;
          }
          .signature-section {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: flex-end;
            text-align: right;
            height: 100%;
            min-height: 90px;
          }
          .sig-title {
            font-size: 10px;
            color: #94a3b8;
            margin-bottom: 40px;
          }
          .sig-line {
            width: 180px;
            border-bottom: 1px solid #475569;
            margin-bottom: 6px;
          }
          .sig-company {
            font-weight: 600;
            color: #475569;
          }
          @media print {
            body {
              padding: 0;
            }
            .invoice-card {
              border: none;
              box-shadow: none;
            }
            @page {
              margin: 15mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header">
            <div class="header-left">
              <h1>${title}</h1>
              <div class="inv-num">Document Ref: ${invoiceNumber}</div>
            </div>
            <div class="header-right">
              <div class="company-name">${compName}</div>
              <div class="company-details">
                <div>GSTIN: ${compGst}</div>
                <div>Address: ${compAddress}</div>
                <div>Phone: ${compPhone}</div>
              </div>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <div class="meta-block-title">Billed To</div>
              <div class="client-name">${clientName}</div>
              <div class="client-details">
                Registered Factory Corporate Partner
              </div>
            </div>
            <div class="meta-dates">
              <div>Invoice Date: <span>${invoiceDate}</span></div>
              ${showDueDate ? `<div>Payment Due: <span class="due-date-alert">${dueDateStr}</span></div>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                ${showSku ? '<th>SKU</th>' : ''}
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                ${showGst ? '<th class="text-right">GST Rate</th>' : ''}
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td style="font-weight: 500; color: #0f172a;">${item.description}</td>
                  ${showSku ? `<td class="sku-code">${item.sku}</td>` : ''}
                  <td class="text-right">${item.qty}</td>
                  <td class="text-right">₹${item.rate.toFixed(2)}</td>
                  ${showGst ? '<td class="text-right">18%</td>' : ''}
                  <td class="text-right" style="font-weight: 600;">₹${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="totals-note">
              * GST registered invoice issued under Isolated Corporate Tenant environment. All rates correspond to standard trade catalogs.
            </div>
            <div>
              <table class="totals-table">
                <tr>
                  <td style="color: #64748b;">Pre-Tax Subtotal:</td>
                  <td class="text-right" style="font-weight: 600; color: #334155;">₹${inv.subTotal.toFixed(2)}</td>
                </tr>
                ${showGst ? `
                <tr>
                  <td style="color: #64748b;">IGST Tax (18%):</td>
                  <td class="text-right" style="font-weight: 600; color: #334155;">₹${inv.taxAmount.toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr class="grand-total">
                  <td>Total Amount:</td>
                  <td class="text-right">₹${(showGst ? inv.totalAmount : inv.subTotal).toFixed(2)}</td>
                </tr>
              </table>
            </div>
          </div>

          <div class="footer-notes">
            <div class="notes-section">
              <div style="margin-bottom: 12px;">
                <h5>Payment Bank Coordinates</h5>
                <div class="notes-content">${bankDetails}</div>
              </div>
              <div>
                <h5>Terms & Conditions</h5>
                <div class="notes-content">${terms}</div>
              </div>
            </div>
            <div class="signature-section">
              <div class="sig-title">Authorized Signature Panel</div>
              <div class="sig-line"></div>
              <div class="sig-company">For ${compName}</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

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
    } catch {
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
    } catch {
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
    } catch {
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

  const revenueTotal = financeData?.invoices.reduce((acc, inv) => acc + inv.subTotal, 0) || 0;
  const expenseTotal = financeData?.expenses.reduce((acc, exp) => acc + exp.amount, 0) || 0;
  const cashInflow = financeData?.payments.reduce((acc, pay) => acc + pay.amount, 0) || 0;
  const netProfit = revenueTotal - expenseTotal;

  return {
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
    setError,
    customers,
    revenueTotal,
    expenseTotal,
    cashInflow,
    netProfit,
    gst: {
      gstAmountInput,
      setGstAmountInput,
      gstRate,
      setGstRate,
      calculatedGST,
      handleCalculateGST,
    },
    invoiceForm: {
      customerId,
      setCustomerId,
      subTotal,
      setSubTotal,
      dueDate,
      setDueDate,
      handleCreateInvoice,
    },
    expenseForm: {
      expCategory,
      setExpCategory,
      expAmount,
      setExpAmount,
      expDesc,
      setExpDesc,
      handleCreateExpense,
    },
    paymentForm: {
      paymentInvoiceId,
      setPaymentInvoiceId,
      paymentAmount,
      setPaymentAmount,
      paymentMethod,
      setPaymentMethod,
      paymentRef,
      setPaymentRef,
      handleRecordPayment,
    },
    handlePrintInvoice,
  };
}
