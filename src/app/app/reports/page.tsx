'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, Activity, Download } from 'lucide-react';

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

const monthlyData = [
  { month: 'Jan', Revenue: 52000, Expenses: 38000, Production: 320 },
  { month: 'Feb', Revenue: 68000, Expenses: 44000, Production: 410 },
  { month: 'Mar', Revenue: 61000, Expenses: 47000, Production: 380 },
  { month: 'Apr', Revenue: 88000, Expenses: 52000, Production: 520 },
  { month: 'May', Revenue: 94000, Expenses: 58000, Production: 560 },
  { month: 'Jun', Revenue: 112000, Expenses: 61000, Production: 640 },
];

const inventoryDistribution = [
  { name: 'Microcontrollers', value: 9375, color: '#38bdf8' },
  { name: 'Plastic Granules', value: 2560, color: '#818cf8' },
  { name: 'Solder Paste', value: 975, color: '#34d399' },
  { name: 'LED Components', value: 90, color: '#fb923c' },
];

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<'financial' | 'production' | 'inventory'>('financial');
  const [generating, setGenerating] = useState(false);

  const handleExport = (format: string) => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      alert(`✅ ${activeReport.charAt(0).toUpperCase() + activeReport.slice(1)} report exported as ${format.toUpperCase()} successfully. File saved to Downloads.`);
    }, 1200);
  };

  const tooltipStyle = {
    backgroundColor: '#111827',
    border: '1px solid #1f2937',
    borderRadius: '12px',
    color: '#f3f4f6',
    fontSize: '11px',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 px-4 py-2.5 text-slate-950 font-bold text-xs hover:scale-[1.02] transition-transform cursor-pointer disabled:opacity-50"
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
          {activeReport === 'financial' && "Financial performance is tracking positively with Q2 revenue exceeding Q1 by 15.8%. Operating margins have improved due to supplier cost optimizations. Net profit trajectory suggests a full-year profitability well above industry benchmarks for discrete electronics manufacturing."}
          {activeReport === 'production' && "Production output has grown 100% from January to June, reflecting successful capacity expansion. SMT Line 01 is operating at peak efficiency with 94%+ yields. BOM cost optimization on Smart Thermostat T1 has reduced per-unit material cost by 8% vs. previous quarter."}
          {activeReport === 'inventory' && "Inventory value distribution shows healthy diversification. However, RGB LED stock represents a critical bottleneck — current levels support fewer than 2 full production cycles. Recommend immediate reorder. All other components maintain 3+ months of buffer stock coverage."}
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Main Chart */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {activeReport === 'financial' && 'Revenue vs Expenses — 6 Month Trend'}
            {activeReport === 'production' && 'Production Unit Output — 6 Month Trend'}
            {activeReport === 'inventory' && 'Inventory Value by Component Category ($)'}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {activeReport === 'inventory' ? (
                <PieChart>
                  <Pie
                    data={inventoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={130}
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
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `$${Number(v ?? 0).toLocaleString()}`} />
                  <Legend iconType="circle" />
                </PieChart>
              ) : activeReport === 'production' ? (
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="Production" fill="#38bdf8" radius={[6, 6, 0, 0]} name="Units Produced" />
                </BarChart>
              ) : (
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="Revenue" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#revGrad)" />
                  <Area type="monotone" dataKey="Expenses" stroke="#f87171" strokeWidth={2} fillOpacity={1} fill="url(#expGrad)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI Cards */}
        {activeReport === 'financial' && (
          <>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Period Totals</h3>
              {[
                { label: 'Total Revenue (H1)', value: '$475,000', color: 'text-sky-400' },
                { label: 'Total Expenses (H1)', value: '$300,000', color: 'text-red-400' },
                { label: 'Net Profit (H1)', value: '$175,000', color: 'text-emerald-400' },
                { label: 'Average Monthly Margin', value: '36.8%', color: 'text-violet-400' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0 text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={`font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expense Breakdown</h3>
              {[
                { label: 'Raw Materials', pct: 45 },
                { label: 'Staff Salaries', pct: 28 },
                { label: 'Utilities & Overhead', pct: 15 },
                { label: 'Machine Maintenance', pct: 12 },
              ].map((item) => (
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
              ))}
            </div>
          </>
        )}

        {activeReport === 'production' && (
          <>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Production KPIs</h3>
              {[
                { label: 'Total Units Produced (H1)', value: '2,830 units' },
                { label: 'Average Monthly Output', value: '471 units' },
                { label: 'Average Yield Rate', value: '94.2%' },
                { label: 'Production Cost per Unit', value: '$42.50' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0 text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-bold text-sky-400">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Status Split</h3>
              {[
                { label: 'Completed Orders', value: '12', color: 'bg-emerald-500' },
                { label: 'In Progress', value: '2', color: 'bg-sky-400' },
                { label: 'Pending Queue', value: '0', color: 'bg-amber-400' },
                { label: 'Cancelled', value: '1', color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0 text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {activeReport === 'inventory' && (
          <>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stock Value Summary</h3>
              {inventoryDistribution.map((item) => (
                <div key={item.name} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-semibold" style={{ color: item.color }}>${item.value.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-secondary/40">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(item.value / 13000) * 100}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-2 text-xs font-bold">
                <span>Total Warehouse Value</span>
                <span className="text-emerald-400">$13,000</span>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reorder Recommendations</h3>
              <div className="space-y-3">
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
                  <div className="font-semibold text-amber-500">🚨 CRITICAL — RGB LEDs</div>
                  <div className="text-muted-foreground mt-1">Current: 450 pcs | Min: 1,000 pcs | Shortfall: 550 pcs</div>
                  <div className="text-amber-500 font-bold mt-1">Reorder 2,000 units immediately</div>
                </div>
                <div className="rounded-xl border border-border bg-secondary/10 p-3 text-xs">
                  <div className="font-semibold text-foreground">✅ MCU Chips — STABLE</div>
                  <div className="text-muted-foreground mt-1">Current: 1,250 pcs | Min: 200 pcs | Coverage: 6+ runs</div>
                </div>
                <div className="rounded-xl border border-border bg-secondary/10 p-3 text-xs">
                  <div className="font-semibold text-foreground">✅ ABS Plastic — STABLE</div>
                  <div className="text-muted-foreground mt-1">Current: 800 kg | Min: 500 kg | 60% above threshold</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
