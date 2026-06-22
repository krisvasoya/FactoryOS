'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, Activity, Download, IndianRupee, AlertTriangle, Layers, Boxes } from 'lucide-react';
import { TableSkeleton } from '@/components/skeleton';

const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false });

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<'financial' | 'production' | 'inventory'>('financial');
  const [generating, setGenerating] = useState(false);

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [financeData, setFinanceData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [productionData, setProductionData] = useState<any>(null);

  useEffect(() => {
    async function loadAllData() {
      try {
        const [dashRes, finRes, invRes, prodRes] = await Promise.all([
          fetch('/api/v1/dashboard'),
          fetch('/api/v1/finance'),
          fetch('/api/v1/inventory'),
          fetch('/api/v1/production'),
        ]);
        if (dashRes.ok && finRes.ok && invRes.ok && prodRes.ok) {
          setDashboardData(await dashRes.json());
          setFinanceData(await finRes.json());
          setInventoryData(await invRes.json());
          setProductionData(await prodRes.json());
        }
      } catch (e) {
        console.error('Failed to load reports telemetry', e);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  const handleExport = (format: string) => {
    setGenerating(true);
    
    try {
      const timestamp = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      if (format === 'csv') {
        let csvContent = '';
        let filename = `${activeReport}_report_${Date.now()}.csv`;

        if (activeReport === 'financial') {
          csvContent += `FactoryOS Financial Report\n`;
          csvContent += `Generated: ${timestamp}\n\n`;
          csvContent += `Summary Metric,Value\n`;
          csvContent += `Total Revenue (All-time),₹${revenueTotal}\n`;
          csvContent += `Total Expenses (All-time),₹${expenseTotal}\n`;
          csvContent += `Net Profit (All-time),₹${netProfit}\n`;
          csvContent += `Average Profit Margin,${averageMargin}%\n\n`;

          csvContent += `Monthly Trend Analysis\n`;
          csvContent += `Month,Revenue (₹),Expenses (₹)\n`;
          financialOverviewData.forEach((row: any) => {
            csvContent += `"${row.name}",${row.Revenue},${row.Expenses}\n`;
          });
          csvContent += `\n`;

          csvContent += `Expense Category Breakdown\n`;
          csvContent += `Category,Percentage (%)\n`;
          expenseBreakdown.forEach((row: any) => {
            csvContent += `"${row.label}",${row.pct}%\n`;
          });
        } else if (activeReport === 'production') {
          csvContent += `FactoryOS Production Yield Report\n`;
          csvContent += `Generated: ${timestamp}\n\n`;
          csvContent += `Summary KPI,Value\n`;
          csvContent += `Total Units Produced,${totalUnitsProduced} units\n`;
          csvContent += `Total Manufacturing Runs,${totalOrdersCount} orders\n`;
          csvContent += `Completion Yield Rate,${yieldRate}%\n`;
          csvContent += `Production Cost per Unit,₹${costPerUnit}\n\n`;

          csvContent += `Weekly Output Metrics\n`;
          csvContent += `Week,Target Units,Completed Units\n`;
          weeklyProductionData.forEach((row: any) => {
            csvContent += `"${row.name}",${row.Target},${row.Completed}\n`;
          });
          csvContent += `\n`;

          csvContent += `Order Production Status Split\n`;
          csvContent += `Status,Count\n`;
          orderStatusSplit.forEach((row: any) => {
            csvContent += `"${row.label}",${row.value}\n`;
          });
        } else {
          csvContent += `FactoryOS Inventory & Stock Report\n`;
          csvContent += `Generated: ${timestamp}\n\n`;
          csvContent += `Total Warehouse Value,₹${totalWarehouseValue}\n\n`;

          csvContent += `Active Stock Distribution\n`;
          csvContent += `Item Name,Current Stock Value (₹)\n`;
          inventoryDistribution.forEach((row: any) => {
            csvContent += `"${row.name}",${row.value}\n`;
          });
          csvContent += `\n`;

          csvContent += `Low Stock Alerts\n`;
          csvContent += `Item SKU,Item Name,Current Stock,Min Threshold,Unit\n`;
          lowStockAlerts.forEach((row: any) => {
            csvContent += `"${row.sku}","${row.name}",${row.currentStock},${row.minStock},"${row.unit}"\n`;
          });
        }

        // Trigger CSV Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === 'pdf') {
        // Generate beautiful HTML for PDF printing in a new window
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          alert('Popup blocked! Please allow popups to export reports as PDF.');
          setGenerating(false);
          return;
        }

        let reportHtml = `
          <html>
          <head>
            <title>${activeReport.charAt(0).toUpperCase() + activeReport.slice(1)} Report - FactoryOS</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                color: #1e293b;
                margin: 40px;
                line-height: 1.5;
              }
              .header {
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 20px;
                margin-bottom: 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .logo {
                font-size: 24px;
                font-weight: 800;
                color: #0f172a;
              }
              .logo span {
                color: #0ea5e9;
              }
              .title {
                text-align: right;
              }
              .title h1 {
                margin: 0;
                font-size: 20px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .title p {
                margin: 5px 0 0 0;
                font-size: 11px;
                color: #64748b;
              }
              .ai-summary {
                background: #f8fafc;
                border-left: 4px solid #6366f1;
                padding: 15px 20px;
                border-radius: 0 8px 8px 0;
                margin-bottom: 30px;
              }
              .ai-summary h3 {
                margin: 0 0 8px 0;
                font-size: 12px;
                text-transform: uppercase;
                color: #4f46e5;
                letter-spacing: 0.5px;
              }
              .ai-summary p {
                margin: 0;
                font-size: 13px;
                color: #475569;
                font-style: italic;
              }
              .kpi-grid {
                display: flex;
                gap: 15px;
                margin-bottom: 30px;
                width: 100%;
              }
              .kpi-card {
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 15px;
                background: #fff;
                flex: 1;
              }
              .kpi-card .label {
                font-size: 10px;
                text-transform: uppercase;
                color: #64748b;
                font-weight: 600;
              }
              .kpi-card .value {
                font-size: 18px;
                font-weight: 700;
                margin-top: 5px;
                color: #0f172a;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
              }
              th, td {
                padding: 10px 12px;
                text-align: left;
                font-size: 12px;
                border-bottom: 1px solid #e2e8f0;
              }
              th {
                background-color: #f1f5f9;
                font-weight: 600;
                color: #334155;
              }
              .footer {
                margin-top: 50px;
                border-top: 1px solid #e2e8f0;
                padding-top: 15px;
                text-align: center;
                font-size: 10px;
                color: #94a3b8;
              }
              @media print {
                body { margin: 20px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">Factory<span>OS</span></div>
              <div class="title">
                <h1>${activeReport.charAt(0).toUpperCase() + activeReport.slice(1)} Report</h1>
                <p>Generated on ${timestamp}</p>
              </div>
            </div>

            <div class="ai-summary">
              <h3>AI Executive Summary</h3>
              <p>${getAiSummary()}</p>
            </div>
        `;

        if (activeReport === 'financial') {
          reportHtml += `
            <div class="kpi-grid">
              <div class="kpi-card">
                <div class="label">Total Revenue</div>
                <div class="value">₹${revenueTotal.toLocaleString()}</div>
              </div>
              <div class="kpi-card">
                <div class="label">Total Expenses</div>
                <div class="value">₹${expenseTotal.toLocaleString()}</div>
              </div>
              <div class="kpi-card">
                <div class="label">Net Profit</div>
                <div class="value">₹${netProfit.toLocaleString()}</div>
              </div>
              <div class="kpi-card">
                <div class="label">Profit Margin</div>
                <div class="value">${averageMargin}%</div>
              </div>
            </div>

            <h3>Monthly Revenue vs Expenses Trend</h3>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                  <th>Expenses</th>
                  <th>Net Income</th>
                </tr>
              </thead>
              <tbody>
                ${financialOverviewData.map((row: any) => `
                  <tr>
                    <td>${row.name}</td>
                    <td>₹${row.Revenue.toLocaleString()}</td>
                    <td>₹${row.Expenses.toLocaleString()}</td>
                    <td style="font-weight: 600; color: ${row.Revenue - row.Expenses >= 0 ? '#10b981' : '#ef4444'}">
                      ₹${(row.Revenue - row.Expenses).toLocaleString()}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <h3>Expense Allocation Breakdown</h3>
            <table>
              <thead>
                <tr>
                  <th>Expense Category</th>
                  <th>Allocation Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${expenseBreakdown.map((row: any) => `
                  <tr>
                    <td>${row.label}</td>
                    <td>${row.pct}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        } else if (activeReport === 'production') {
          reportHtml += `
            <div class="kpi-grid">
              <div class="kpi-card">
                <div class="label">Units Produced</div>
                <div class="value">${totalUnitsProduced.toLocaleString()} pcs</div>
              </div>
              <div class="kpi-card">
                <div class="label">Active Runs</div>
                <div class="value">${totalOrdersCount} orders</div>
              </div>
              <div class="kpi-card">
                <div class="label">Yield Rate</div>
                <div class="value">${yieldRate}%</div>
              </div>
              <div class="kpi-card">
                <div class="label">Cost Per Unit</div>
                <div class="value">₹${costPerUnit}</div>
              </div>
            </div>

            <h3>Weekly Output Targets vs Completion</h3>
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Target Units</th>
                  <th>Completed Units</th>
                  <th>Variance</th>
                </tr>
              </thead>
              <tbody>
                ${weeklyProductionData.map((row: any) => `
                  <tr>
                    <td>${row.name}</td>
                    <td>${row.Target.toLocaleString()}</td>
                    <td>${row.Completed.toLocaleString()}</td>
                    <td style="font-weight: 600; color: ${row.Completed >= row.Target ? '#10b981' : '#f59e0b'}">
                      ${row.Completed - row.Target >= 0 ? '+' : ''}${(row.Completed - row.Target).toLocaleString()}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <h3>Order Status Summary</h3>
            <table>
              <thead>
                <tr>
                  <th>Status Category</th>
                  <th>Active Count</th>
                </tr>
              </thead>
              <tbody>
                ${orderStatusSplit.map((row: any) => `
                  <tr>
                    <td>${row.label}</td>
                    <td>${row.value}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        } else {
          reportHtml += `
            <div class="kpi-grid">
              <div class="kpi-card">
                <div class="label">Total Warehouse Value</div>
                <div class="value">₹${totalWarehouseValue.toLocaleString()}</div>
              </div>
              <div class="kpi-card">
                <div class="label">Low Stock Alerts</div>
                <div class="value">${lowStockAlerts.length} items</div>
              </div>
            </div>

            <h3>Inventory Value Distribution</h3>
            <table>
              <thead>
                <tr>
                  <th>Material / Product Name</th>
                  <th>Estimated Holding Value</th>
                </tr>
              </thead>
              <tbody>
                ${inventoryDistribution.map((row: any) => `
                  <tr>
                    <td>${row.name}</td>
                    <td style="font-weight: 600;">₹${row.value.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <h3>Low Stock Recommendations</h3>
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Component Name</th>
                  <th>Current Stock</th>
                  <th>Min Threshold</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${lowStockAlerts.length === 0 ? `
                  <tr>
                    <td colspan="5" style="text-align: center; color: #64748b;">All stock items are currently above safety thresholds.</td>
                  </tr>
                ` : lowStockAlerts.map((row: any) => `
                  <tr>
                    <td>${row.sku}</td>
                    <td>${row.name}</td>
                    <td>${row.currentStock} ${row.unit}</td>
                    <td>${row.minStock} ${row.unit}</td>
                    <td style="font-weight: 600; color: #ef4444;">CRITICAL SHORTFALL</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        }

        reportHtml += `
            <div class="footer">
              FactoryOS Business Intelligence Reporting Engine &copy; 2026. Confidential and proprietary.
            </div>
          </body>
          </html>
        `;

        printWindow.document.write(reportHtml);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 300);
      }
    } catch (e) {
      console.error('Failed to export report', e);
      alert('⚠️ An error occurred during export.');
    } finally {
      setTimeout(() => {
        setGenerating(false);
      }, 500);
    }
  };

  const tooltipStyle = {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    color: 'var(--foreground)',
    fontSize: '11px',
  };

  if (loading) {
    return <TableSkeleton />;
  }

  // 1. Calculations - Financial tab
  const financialOverviewData = dashboardData?.financialData || [];
  const hasFinanceData = financialOverviewData.some((d: any) => d.Revenue > 0 || d.Expenses > 0);
  const revenueTotal = financeData?.invoices.reduce((acc: number, inv: any) => acc + inv.subTotal, 0) || 0;
  const expenseTotal = financeData?.expenses.reduce((acc: number, exp: any) => acc + exp.amount, 0) || 0;
  const netProfit = revenueTotal - expenseTotal;
  const averageMargin = revenueTotal > 0 ? ((netProfit / revenueTotal) * 100).toFixed(1) : '0';

  const expCategorySum = (catName: string) => {
    return financeData?.expenses
      .filter((e: any) => e.category === catName)
      .reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
  };

  const rmExpense = expCategorySum('Raw Materials');
  const salariesExpense = expCategorySum('Salaries');
  const utilitiesExpense = expCategorySum('Utilities');
  const maintenanceExpense = expCategorySum('Maintenance');
  const otherExpense = expCategorySum('Other');
  
  const totalExpenseDenominator = expenseTotal || 1;
  const expenseBreakdown = [
    { label: 'Raw Materials', pct: Math.round((rmExpense / totalExpenseDenominator) * 100) },
    { label: 'Staff Salaries', pct: Math.round((salariesExpense / totalExpenseDenominator) * 100) },
    { label: 'Utilities & Overhead', pct: Math.round((utilitiesExpense / totalExpenseDenominator) * 100) },
    { label: 'Machine Maintenance', pct: Math.round((maintenanceExpense / totalExpenseDenominator) * 100) },
  ];

  // 2. Calculations - Production tab
  const productionOrders = productionData?.productionOrders || [];
  const completedOrders = productionOrders.filter((o: any) => o.status === 'Completed');
  const totalUnitsProduced = completedOrders.reduce((sum: number, o: any) => sum + o.quantity, 0) || 0;
  const totalCompletedCost = completedOrders.reduce((sum: number, o: any) => sum + o.cost, 0) || 0;
  const costPerUnit = totalUnitsProduced > 0 ? (totalCompletedCost / totalUnitsProduced).toFixed(2) : '0.00';
  const totalOrdersCount = productionOrders.length;
  const yieldRate = totalOrdersCount > 0 ? ((completedOrders.length / totalOrdersCount) * 100).toFixed(1) : '0';

  const weeklyProductionData = dashboardData?.productionData || [];
  const hasProductionData = weeklyProductionData.some((d: any) => d.Target > 0 || d.Completed > 0);

  const orderStatusSplit = [
    { label: 'Completed Orders', value: completedOrders.length, color: 'bg-emerald-500' },
    { label: 'In Progress', value: productionOrders.filter((o: any) => o.status === 'InProgress').length, color: 'bg-sky-400' },
    { label: 'Pending Queue', value: productionOrders.filter((o: any) => o.status === 'Pending').length, color: 'bg-amber-400' },
    { label: 'Cancelled', value: productionOrders.filter((o: any) => o.status === 'Cancelled').length, color: 'bg-red-500' },
  ];

  // 3. Calculations - Inventory tab
  const inventoryItems = inventoryData?.inventoryItems || [];
  const totalWarehouseValue = inventoryItems.reduce((acc: number, item: any) => {
    const cost = item.product?.cost || item.rawMaterial?.cost || 0;
    return acc + (item.quantity * cost);
  }, 0) || 0;

  const groupedMap: { [key: string]: number } = {};
  inventoryItems.forEach((item: any) => {
    const name = item.product?.name || item.rawMaterial?.name || 'Unknown Item';
    const cost = item.product?.cost || item.rawMaterial?.cost || 0;
    groupedMap[name] = (groupedMap[name] || 0) + (item.quantity * cost);
  });

  const colors = ['#38bdf8', '#818cf8', '#34d399', '#fb923c', '#a855f7'];
  const inventoryDistribution = Object.entries(groupedMap)
    .map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const hasInventoryData = inventoryDistribution.length > 0;
  const lowStockAlerts = dashboardData?.lowStock || [];

  // 4. Calculations - AI Executive Summary
  const getAiSummary = () => {
    if (activeReport === 'financial') {
      return hasFinanceData 
        ? `Financial performance is tracking with total invoicing at ₹${revenueTotal.toLocaleString()} and operating expenses at ₹${expenseTotal.toLocaleString()}. The average monthly profit margin sits at ${averageMargin}%. Net profit details suggest healthy operational viability.`
        : 'No financial transactions have been recorded yet. Operating logs will populate here dynamically once sales invoices or operational expenses are registered in the finance dashboard.';
    }
    if (activeReport === 'production') {
      return hasProductionData 
        ? `Production output shows a total yield of ${totalUnitsProduced} completed units across active cycles, operating at an average yield rate of ${yieldRate}%. Weekly target vs completed metrics suggest stable capacity utilization.`
        : 'No manufacturing cycles or BOM formulas have been registered yet. Once production runs are initiated, yield performance metrics will populate here dynamically.';
    }
    return hasInventoryData 
      ? `Inventory distribution spans ${inventoryDistribution.length} active material categories with a total value of ₹${totalWarehouseValue.toLocaleString()}. ${lowStockAlerts.length > 0 ? `Critical: Reorder needed for ${lowStockAlerts[0].name}.` : 'All safety stock levels are optimal.'}`
      : 'No warehouse stock has been recorded yet. Inbound inventory movements will populate here dynamically once raw components or finished products are added.';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between animate-fade-in">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Business Intelligence Reports</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Comprehensive analytics across finance, production, and inventory with AI-generated summaries.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-secondary/40 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2.5 text-xs hover:scale-[1.02] hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
          >
            {generating ? <Activity className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Export PDF
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex gap-2">
        {(['financial', 'production', 'inventory'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveReport(tab)}
            className={`rounded-xl px-4 py-2.5 text-xs font-semibold capitalize transition-all ${
              activeReport === tab
                ? 'bg-secondary text-primary dark:text-sky-400 shadow-sm'
                : 'text-muted-foreground hover:bg-secondary/40'
            }`}
          >
            {tab} Report
          </button>
        ))}
      </div>

      {/* AI Generated Summary */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-900/10 to-indigo-900/5 p-5 space-y-2">
        <div className="text-[10px] uppercase font-bold tracking-wider text-violet-500 flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" /> AI Executive Summary
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {getAiSummary()}
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Main Chart */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {activeReport === 'financial' && 'Revenue vs Expenses — 7 Month Trend'}
            {activeReport === 'production' && 'Production Unit Output — 4 Week Trend'}
            {activeReport === 'inventory' && 'Inventory Value by Component Category (₹)'}
          </h3>
          <div className="h-72">
            {activeReport === 'financial' && (
              !hasFinanceData ? (
                <div className="flex h-full flex-col items-center justify-center border border-dashed border-border rounded-xl bg-secondary/5 p-4 text-center">
                  <IndianRupee className="h-8 w-8 text-muted-foreground/50 mb-1.5" />
                  <p className="text-xs font-semibold text-foreground">No financial activity recorded</p>
                  <p className="text-[10px] text-muted-foreground max-w-xs mx-auto mt-0.5">Invoices and expenses registered for this month will generate real-time revenue audits here.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialOverviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area type="monotone" dataKey="Revenue" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#revGrad)" />
                    <Area type="monotone" dataKey="Expenses" stroke="#f87171" strokeWidth={2} fillOpacity={1} fill="url(#expGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )
            )}

            {activeReport === 'production' && (
              !hasProductionData ? (
                <div className="flex h-full flex-col items-center justify-center border border-dashed border-border rounded-xl bg-secondary/5 p-4 text-center">
                  <Activity className="h-8 w-8 text-muted-foreground/50 mb-1.5" />
                  <p className="text-xs font-semibold text-foreground">No production logs found</p>
                  <p className="text-[10px] text-muted-foreground max-w-xs mx-auto mt-0.5">Create and complete manufacturing runs in the production board to display weekly target metrics.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyProductionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Bar dataKey="Target" fill="#818cf8" radius={[4, 4, 0, 0]} name="Target Units" />
                    <Bar dataKey="Completed" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Completed Units" />
                  </BarChart>
                </ResponsiveContainer>
              )
            )}

            {activeReport === 'inventory' && (
              !hasInventoryData ? (
                <div className="flex h-full flex-col items-center justify-center border border-dashed border-border rounded-xl bg-secondary/5 p-4 text-center">
                  <Boxes className="h-8 w-8 text-muted-foreground/50 mb-1.5" />
                  <p className="text-xs font-semibold text-foreground">No inventory stock cataloged</p>
                  <p className="text-[10px] text-muted-foreground max-w-xs mx-auto mt-0.5">Add items to warehouse inventory to populate category analytics.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      label={(props: { name?: string; percent?: number }) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {inventoryDistribution.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `₹${Number(v ?? 0).toLocaleString()}`} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )
            )}
          </div>
        </div>

        {/* KPI Cards */}
        {activeReport === 'financial' && (
          <>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Period Totals</h3>
              {[
                { label: 'Total Revenue (All-time)', value: `₹${revenueTotal.toLocaleString()}`, color: 'text-sky-400' },
                { label: 'Total Expenses (All-time)', value: `₹${expenseTotal.toLocaleString()}`, color: 'text-red-400' },
                { label: 'Net Profit (All-time)', value: `₹${netProfit.toLocaleString()}`, color: 'text-emerald-400' },
                { label: 'Average Profit Margin', value: `${averageMargin}%`, color: 'text-violet-400' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0 text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={`font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expense Breakdown</h3>
              {!hasFinanceData || expenseTotal === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground py-12">
                  No expense records logged to breakdown.
                </div>
              ) : (
                expenseBreakdown.map((item) => (
                  <div key={item.label} className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-semibold">{item.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-secondary/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-700"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeReport === 'production' && (
          <>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Production KPIs</h3>
              {[
                { label: 'Total Units Produced', value: `${totalUnitsProduced.toLocaleString()} units` },
                { label: 'Manufacturing Runs', value: `${totalOrdersCount} orders` },
                { label: 'Completion Yield Rate', value: `${yieldRate}%` },
                { label: 'Production Cost per Unit', value: `₹${costPerUnit}` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0 text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-bold text-sky-400">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Status Split</h3>
              {productionOrders.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground py-12">
                  No order runs initialized yet.
                </div>
              ) : (
                orderStatusSplit.map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0 text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <span className="text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeReport === 'inventory' && (
          <>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stock Value Summary</h3>
              {!hasInventoryData ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground py-12">
                  No inventory data.
                </div>
              ) : (
                <>
                  {inventoryDistribution.map((item) => (
                    <div key={item.name} className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground truncate max-w-[200px]">{item.name}</span>
                        <span className="font-semibold" style={{ color: item.color }}>₹{item.value.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary/40">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${(item.value / (totalWarehouseValue || 1)) * 100}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-border pt-2 text-xs font-bold">
                    <span>Total Warehouse Value</span>
                    <span className="text-emerald-400">₹{totalWarehouseValue.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reorder Recommendations</h3>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {lowStockAlerts.length === 0 ? (
                  <div className="rounded-xl border border-border bg-secondary/10 p-3 text-xs text-center text-muted-foreground py-8">
                    ✅ All material components are currently above safety stock thresholds.
                  </div>
                ) : (
                  lowStockAlerts.map((alert: any) => (
                    <div key={alert.id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
                      <div className="font-semibold text-amber-500">🚨 CRITICAL — {alert.name}</div>
                      <div className="text-muted-foreground mt-1">Current: {alert.currentStock} {alert.unit} | Min: {alert.minStock} {alert.unit}</div>
                      <div className="text-amber-500 font-bold mt-1">Shortfall detected. Reorder recommended immediately.</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
