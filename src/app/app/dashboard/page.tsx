'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  DollarSign,
  PackageCheck,
  Cpu,
  RefreshCw,
  Boxes,
  Zap,
  ClipboardList,
  BarChart2,
  ShoppingBag,
  Hourglass,
} from 'lucide-react';

// Dynamically import Recharts to avoid SSR hydration mismatches
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const LineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((mod) => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });

interface DashboardData {
  metrics: {
    todaySales: number;
    monthlySales: number;
    revenue: number;
    expenses: number;
    netProfit: number;
    cashFlow: number;
    inventoryValue: number;
    healthScore: number;
  };
  production: {
    pending: number;
    active: number;
    completed: number;
  };
  machines: {
    active: number;
    maintenance: number;
    offline: number;
  };
  lowStock: Array<{
    id: string;
    sku: string;
    name: string;
    currentStock: number;
    minStock: number;
    unit: string;
  }>;
  recentLogs: Array<{
    id: string;
    action: string;
    user: string;
    entity: string;
    time: string;
  }>;
  aiRecommendations: string[];
}

const financialData = [
  { name: 'Jan', Revenue: 4200, Expenses: 2500 },
  { name: 'Feb', Revenue: 3800, Expenses: 1400 },
  { name: 'Mar', Revenue: 9800, Expenses: 2800 },
  { name: 'Apr', Revenue: 2600, Expenses: 3800 },
  { name: 'May', Revenue: 4800, Expenses: 5000 },
  { name: 'Jun', Revenue: 3400, Expenses: 4200 },
  { name: 'Jul', Revenue: 3500, Expenses: 4000 },
];

const productionData = [
  { name: 'Week 1', Target: 440, Completed: 430 },
  { name: 'Week 2', Target: 470, Completed: 300 },
  { name: 'Week 3', Target: 480, Completed: 560 },
  { name: 'Week 4', Target: 510, Completed: 580 },
];

const recentActivities = [
  { id: 1, title: 'New production order created', detail: 'PO-2026-089 • 150 units', time: '2 min ago', type: 'production' },
  { id: 2, title: 'Invoice #INV-2026-047 marked paid', detail: '$4,250.00 received', time: '18 min ago', type: 'finance' },
  { id: 3, title: 'Low stock alert triggered', detail: 'RGB LEDs below min threshold', time: '1 hr ago', type: 'alert' },
  { id: 4, title: 'Machine maintenance completed', detail: 'Plastic Injection Press 01', time: '3 hr ago', type: 'machine' },
  { id: 5, title: 'New supplier added', detail: 'Apex Components Ltd.', time: '5 hr ago', type: 'supplier' },
];

const aiInsights = [
  'Revenue trending +14% above 3-month average.',
  'Reorder RGB LEDs — stock critical (450 units, min 1000).',
  'Machine efficiency at 91% — optimal range.',
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboardData() {
    try {
      const res = await fetch('/api/v1/dashboard');
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
      }
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3" style={{ color: 'var(--muted-foreground)' }}>
          <Activity className="h-8 w-8 text-slate-400 animate-spin" />
          <span className="text-xs font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center text-center">
        <div className="space-y-4">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
          <h2 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Failed to load dashboard</h2>
          <button
            onClick={loadDashboardData}
            className="btn-secondary text-xs px-4 py-2"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Total Revenue',
      value: `$${data.metrics.monthlySales.toLocaleString()}`,
      change: '24.5% vs last month',
      positive: true,
      icon: DollarSign,
      iconColor: 'var(--status-success-text)',
      iconBg: 'var(--status-success-bg)',
    },
    {
      label: 'Net Profit',
      value: `$${data.metrics.netProfit.toLocaleString()}`,
      change: '18.3% vs last month',
      positive: true,
      icon: TrendingUp,
      iconColor: 'var(--status-success-text)',
      iconBg: 'var(--status-success-bg)',
    },
    {
      label: 'Total Orders',
      value: `${data.production.pending + data.production.active + data.production.completed}`,
      change: '12.6% vs last month',
      positive: true,
      icon: ShoppingBag,
      iconColor: 'var(--status-info-text)',
      iconBg: 'var(--status-info-bg)',
    },
    {
      label: 'Pending Orders',
      value: `${data.production.pending}`,
      change: '8.3% vs last month',
      positive: false,
      icon: Hourglass,
      iconColor: 'var(--status-warning-text)',
      iconBg: 'var(--status-warning-bg)',
    },
    {
      label: 'Low Stock Items',
      value: `${data.lowStock.length}`,
      change: 'Reorder Needed',
      positive: false,
      icon: Boxes,
      iconColor: 'var(--status-danger-text)',
      iconBg: 'var(--status-danger-bg)',
    },
  ];

  const tooltipStyle = {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '11px',
    color: 'var(--foreground)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Overview of your factory operations and financial health.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary text-xs flex items-center gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="card-metric animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>
                    {m.label}
                  </p>
                  <p
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {m.value}
                  </p>
                </div>
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: m.iconBg }}
                >
                  <Icon className="h-4 w-4" style={{ color: m.iconColor }} />
                </div>
              </div>
              <p
                className="text-[11px] mt-2.5 flex items-center gap-1 font-semibold"
                style={{
                  color: m.positive === true ? 'var(--status-success-text)' : m.positive === false ? 'var(--status-danger-text)' : 'var(--muted-foreground)',
                }}
              >
                {m.positive === true && <TrendingUp className="h-3 w-3" />}
                {m.positive === false && <TrendingDown className="h-3 w-3" />}
                {m.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Financial Overview Chart */}
        <div
          className="lg:col-span-2 card p-5 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="mb-4">
            <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
              Financial Overview
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Revenue vs Expenses over the last 7 months
            </p>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} barSize={10} barGap={2} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--chart-text)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--chart-text)' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--hover-bg)' }} />
                <Bar dataKey="Revenue" fill="var(--chart-primary)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Expenses" fill="var(--chart-secondary)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
              <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ backgroundColor: 'var(--chart-primary)' }} />
              Revenue
            </span>
            <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
              <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ backgroundColor: 'var(--chart-secondary)' }} />
              Expenses
            </span>
          </div>
        </div>

        {/* Production Output Chart */}
        <div
          className="card p-5 animate-fade-in-up"
          style={{ animationDelay: '0.28s' }}
        >
          <div className="mb-4">
            <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
              Production Output
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Target vs Completed units (Weekly)
            </p>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productionData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--chart-text)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--chart-text)' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="Target"
                  stroke="var(--chart-secondary)"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ r: 4, fill: 'var(--chart-secondary)', strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="Completed"
                  stroke="var(--chart-primary)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: 'var(--chart-primary)', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
              <span className="h-0.5 w-4 inline-block border-t-2 border-dashed" style={{ borderColor: 'var(--chart-secondary)' }} />
              Target
            </span>
            <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
              <span className="h-0.5 w-4 inline-block" style={{ backgroundColor: 'var(--chart-primary)' }} />
              Completed
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Activity + AI Insights + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activities */}
        <div
          className="lg:col-span-2 card p-5 animate-fade-in-up"
          style={{ animationDelay: '0.35s' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                Recent Activities
              </h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                Latest operations across all modules
              </p>
            </div>
            <ClipboardList className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <div className="space-y-0">
            {recentActivities.map((act, idx) => (
              <div
                key={act.id}
                className="flex items-start gap-3 py-3 transition-colors duration-150 rounded-lg px-2 -mx-2 cursor-default hover:bg-(--hover-bg)"
                style={{
                  borderBottom: idx < recentActivities.length - 1 ? '1px solid var(--border)' : 'none',
                  animationDelay: `${idx * 0.05 + 0.4}s`,
                }}
              >
                <div
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor:
                      act.type === 'finance' ? 'var(--status-success-bg)' :
                      act.type === 'alert'   ? 'var(--status-warning-bg)' :
                      act.type === 'machine' ? 'var(--status-info-bg)' :
                      act.type === 'production' ? 'var(--status-success-bg)' :
                      'var(--card-subtle)',
                  }}
                >
                  {act.type === 'production' && <ClipboardList className="h-3.5 w-3.5" style={{ color: 'var(--status-success-text)' }} />}
                  {act.type === 'finance'    && <DollarSign className="h-3.5 w-3.5" style={{ color: 'var(--status-success-text)' }} />}
                  {act.type === 'alert'      && <AlertTriangle className="h-3.5 w-3.5" style={{ color: 'var(--status-warning-text)' }} />}
                  {act.type === 'machine'    && <Cpu className="h-3.5 w-3.5" style={{ color: 'var(--status-info-text)' }} />}
                  {act.type === 'supplier'   && <PackageCheck className="h-3.5 w-3.5 style={{ color: 'var(--muted-foreground)' }}" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                    {act.title}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {act.detail}
                  </p>
                </div>
                <span className="text-[10px] shrink-0 mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Insights + Operation Stats */}
        <div className="space-y-4">
          {/* AI Insights */}
          <div
            className="card p-5 animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                AI Insights
              </h3>
            </div>
            <div className="space-y-2">
              {aiInsights.map((insight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg p-2.5 text-[11px] leading-relaxed"
                  style={{ backgroundColor: 'var(--card-subtle)', color: 'var(--muted-foreground)' }}
                >
                  <span
                    className="shrink-0 mt-1 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--chart-primary)' }}
                  />
                  {insight}
                </div>
              ))}
            </div>
          </div>

          {/* Machine Status */}
          <div
            className="card p-5 animate-fade-in-up"
            style={{ animationDelay: '0.45s' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                Machine Status
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg p-2.5" style={{ backgroundColor: 'var(--status-success-bg)' }}>
                <div className="text-base font-bold" style={{ color: 'var(--status-success-text)' }}>{data.machines.active}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--status-success-text)' }}>Active</div>
              </div>
              <div className="rounded-lg p-2.5" style={{ backgroundColor: 'var(--status-warning-bg)' }}>
                <div className="text-base font-bold" style={{ color: 'var(--status-warning-text)' }}>{data.machines.maintenance}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--status-warning-text)' }}>Service</div>
              </div>
              <div className="rounded-lg p-2.5" style={{ backgroundColor: 'var(--status-danger-bg)' }}>
                <div className="text-base font-bold" style={{ color: 'var(--status-danger-text)' }}>{data.machines.offline}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--status-danger-text)' }}>Offline</div>
              </div>
            </div>
          </div>

          {/* Health Score */}
          <div
            className="card p-5 animate-fade-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  Operations Health
                </p>
                <p className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>
                  {data.metrics.healthScore}%
                </p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--status-success-text)' }}>
                  System optimal
                </p>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--metric-bg)' }}>
                <Zap className="h-5 w-5 text-slate-600 fill-slate-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
