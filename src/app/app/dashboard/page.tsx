'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  IndianRupee,
  Cpu,
  RefreshCw,
  Boxes,
  Zap,
  ClipboardList,
  BarChart2,
  ShoppingBag,
  Hourglass,
} from 'lucide-react';
import { DashboardSkeleton } from '@/components/skeleton';

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
    timeAgo?: string;
  }>;
  aiRecommendations: string[];
  financialData: Array<{ name: string; Revenue: number; Expenses: number }>;
  productionData: Array<{ name: string; Target: number; Completed: number }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboardData() {
    try {
      const res = await fetch('/api/v1/dashboard');
      if (res.ok) {
        const payload = await res.json();
        
        const now = Date.now();
        const processedLogs = (payload.recentLogs || []).map((log: { id: string; action: string; user: string; entity: string; time: string }) => {
          const diff = now - new Date(log.time).getTime();
          const mins = Math.floor(diff / 60000);
          const hrs = Math.floor(mins / 60);
          const days = Math.floor(hrs / 24);

          let timeAgo = '';
          if (mins < 1) timeAgo = 'Just now';
          else if (mins < 60) timeAgo = `${mins} min ago`;
          else if (hrs < 24) timeAgo = `${hrs} hr ago`;
          else timeAgo = `${days} days ago`;

          return { ...log, timeAgo };
        });

        setData({ ...payload, recentLogs: processedLogs });
      }
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      loadDashboardData();
    }, 0);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const formatLogTitle = (action: string, entity: string) => {
    if (action === 'Create' && entity === 'ProductionOrder') return 'New production order created';
    if (action === 'Update' && entity === 'Invoice') return 'Invoice status updated';
    if (action === 'Create' && entity === 'Invoice') return 'New invoice issued';
    if (action === 'Create' && entity === 'Payment') return 'Payment recorded';
    if (action === 'Create' && entity === 'Expense') return 'New expense logged';
    if (action === 'Create' && entity === 'RawMaterial') return 'New raw material added';
    if (action === 'Create' && entity === 'Product') return 'New finished product added';
    if (action === 'Update' && entity === 'Machine') return 'Machine status modified';
    return `${action} action on ${entity}`;
  };

  if (loading) {
    return <DashboardSkeleton />;
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

  const hasFinanceData = data.financialData && data.financialData.some(d => d.Revenue > 0 || d.Expenses > 0);
  const hasProductionData = data.productionData && data.productionData.some(d => d.Target > 0 || d.Completed > 0);

  // Calculate Revenue MoM Change
  let revenueChangeText = '0.0% vs last month';
  let revenuePositive: boolean | 'neutral' = 'neutral';
  if (data.financialData && data.financialData.length >= 2) {
    const currentRev = data.financialData[data.financialData.length - 1].Revenue;
    const prevRev = data.financialData[data.financialData.length - 2].Revenue;
    if (prevRev > 0) {
      const changeVal = ((currentRev - prevRev) / prevRev) * 100;
      if (changeVal > 0) {
        revenueChangeText = `+${changeVal.toFixed(1)}% vs last month`;
        revenuePositive = true;
      } else if (changeVal < 0) {
        revenueChangeText = `${changeVal.toFixed(1)}% vs last month`;
        revenuePositive = false;
      } else {
        revenueChangeText = '0.0% vs last month';
        revenuePositive = 'neutral';
      }
    } else if (currentRev > 0) {
      revenueChangeText = '+100.0% vs last month';
      revenuePositive = true;
    }
  }

  // Calculate Net Profit MoM Change
  let profitChangeText = '0.0% vs last month';
  let profitPositive: boolean | 'neutral' = 'neutral';
  if (data.financialData && data.financialData.length >= 2) {
    const currentRev = data.financialData[data.financialData.length - 1].Revenue;
    const currentExp = data.financialData[data.financialData.length - 1].Expenses;
    const prevRev = data.financialData[data.financialData.length - 2].Revenue;
    const prevExp = data.financialData[data.financialData.length - 2].Expenses;
    const currentProfit = currentRev - currentExp;
    const prevProfit = prevRev - prevExp;
    if (prevProfit !== 0) {
      const changeVal = ((currentProfit - prevProfit) / Math.abs(prevProfit)) * 100;
      if (changeVal > 0) {
        profitChangeText = `+${changeVal.toFixed(1)}% vs last month`;
        profitPositive = true;
      } else if (changeVal < 0) {
        profitChangeText = `${changeVal.toFixed(1)}% vs last month`;
        profitPositive = false;
      } else {
        profitChangeText = '0.0% vs last month';
        profitPositive = 'neutral';
      }
    } else if (currentProfit !== 0) {
      profitChangeText = currentProfit > 0 ? '+100.0% vs last month' : '-100.0% vs last month';
      profitPositive = currentProfit > 0;
    }
  }

  // Calculate Total Orders Change
  let ordersChangeText = '0.0% vs last week';
  let ordersPositive: boolean | 'neutral' = 'neutral';
  if (data.productionData && data.productionData.length >= 2) {
    const currentOrders = data.productionData[data.productionData.length - 1].Target;
    const prevOrders = data.productionData[data.productionData.length - 2].Target;
    if (prevOrders > 0) {
      const changeVal = ((currentOrders - prevOrders) / prevOrders) * 100;
      if (changeVal > 0) {
        ordersChangeText = `+${changeVal.toFixed(1)}% vs last week`;
        ordersPositive = true;
      } else if (changeVal < 0) {
        ordersChangeText = `${changeVal.toFixed(1)}% vs last week`;
        ordersPositive = false;
      } else {
        ordersChangeText = '0.0% vs last week';
        ordersPositive = 'neutral';
      }
    } else if (currentOrders > 0) {
      ordersChangeText = '+100.0% vs last week';
      ordersPositive = true;
    }
  }

  // Calculate Pending Orders Change
  let pendingChangeText = '0.0% vs last week';
  let pendingPositive: boolean | 'neutral' = 'neutral';
  if (data.productionData && data.productionData.length >= 2) {
    const currentOrders = data.productionData[data.productionData.length - 1].Target;
    const currentCompleted = data.productionData[data.productionData.length - 1].Completed;
    const prevOrders = data.productionData[data.productionData.length - 2].Target;
    const prevCompleted = data.productionData[data.productionData.length - 2].Completed;
    const currentPending = Math.max(0, currentOrders - currentCompleted);
    const prevPending = Math.max(0, prevOrders - prevCompleted);
    if (prevPending > 0) {
      const changeVal = ((currentPending - prevPending) / prevPending) * 100;
      if (changeVal > 0) {
        pendingChangeText = `+${changeVal.toFixed(1)}% vs last week`;
        pendingPositive = false; // Increasing pending orders is bad
      } else if (changeVal < 0) {
        pendingChangeText = `${changeVal.toFixed(1)}% vs last week`;
        pendingPositive = true; // Decreasing pending orders is good
      } else {
        pendingChangeText = '0.0% vs last week';
        pendingPositive = 'neutral';
      }
    } else if (currentPending > 0) {
      pendingChangeText = '+100.0% vs last week';
      pendingPositive = false;
    }
  }

  const metrics = [
    {
      label: 'Total Revenue',
      value: `₹${data.metrics.monthlySales.toLocaleString()}`,
      change: revenueChangeText,
      positive: revenuePositive,
      icon: IndianRupee,
      iconColor: 'var(--status-success-text)',
      iconBg: 'var(--status-success-bg)',
    },
    {
      label: 'Net Profit',
      value: `₹${data.metrics.netProfit.toLocaleString()}`,
      change: profitChangeText,
      positive: profitPositive,
      icon: TrendingUp,
      iconColor: 'var(--status-success-text)',
      iconBg: 'var(--status-success-bg)',
    },
    {
      label: 'Total Orders',
      value: `${data.production.pending + data.production.active + data.production.completed}`,
      change: ordersChangeText,
      positive: ordersPositive,
      icon: ShoppingBag,
      iconColor: 'var(--status-info-text)',
      iconBg: 'var(--status-info-bg)',
    },
    {
      label: 'Pending Orders',
      value: `${data.production.pending}`,
      change: pendingChangeText,
      positive: pendingPositive,
      icon: Hourglass,
      iconColor: 'var(--status-warning-text)',
      iconBg: 'var(--status-warning-bg)',
    },
    {
      label: 'Low Stock Items',
      value: `${data.lowStock.length}`,
      change: data.lowStock.length > 0 ? 'Reorder Needed' : 'All stock healthy',
      positive: data.lowStock.length > 0 ? false : 'neutral',
      icon: Boxes,
      iconColor: data.lowStock.length > 0 ? 'var(--status-danger-text)' : 'var(--status-success-text)',
      iconBg: data.lowStock.length > 0 ? 'var(--status-danger-bg)' : 'var(--status-success-bg)',
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
            {!hasFinanceData ? (
              <div className="flex h-full flex-col items-center justify-center border border-dashed border-border rounded-xl bg-secondary/5 p-4 text-center">
                <IndianRupee className="h-8 w-8 text-muted-foreground/50 mb-1.5" />
                <p className="text-xs font-semibold text-foreground">No financial activity recorded</p>
                <p className="text-[10px] text-muted-foreground max-w-xs mx-auto mt-0.5">Invoices and expenses registered for this month will generate real-time revenue audits here.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.financialData} barSize={10} barGap={2} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--chart-text)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--chart-text)' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--hover-bg)' }} />
                  <Bar dataKey="Revenue" fill="var(--chart-primary)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Expenses" fill="var(--chart-secondary)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
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
            {!hasProductionData ? (
              <div className="flex h-full flex-col items-center justify-center border border-dashed border-border rounded-xl bg-secondary/5 p-4 text-center">
                <Activity className="h-8 w-8 text-muted-foreground/50 mb-1.5" />
                <p className="text-xs font-semibold text-foreground">No production logs found</p>
                <p className="text-[10px] text-muted-foreground max-w-xs mx-auto mt-0.5">Create and complete manufacturing runs in the production board to display weekly target metrics.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.productionData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
            )}
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
            {data.recentLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl bg-secondary/5 mt-2">
                No recent activity logged yet.
              </div>
            ) : (
              data.recentLogs.map((log, idx) => {
                const isProduction = log.entity === 'ProductionOrder' || log.entity === 'BillOfMaterials' || log.entity === 'Machine';
                const isFinance = log.entity === 'Invoice' || log.entity === 'Expense' || log.entity === 'Payment';
                const isInventory = log.entity === 'InventoryItem' || log.entity === 'StockMovement' || log.entity === 'RawMaterial' || log.entity === 'Product';
                
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 py-3 transition-colors duration-150 rounded-lg px-2 -mx-2 cursor-default hover:bg-hover-bg"
                    style={{
                      borderBottom: idx < data.recentLogs.length - 1 ? '1px solid var(--border)' : 'none',
                      animationDelay: `${idx * 0.05 + 0.4}s`,
                    }}
                  >
                    <div
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor:
                          isFinance ? 'var(--status-success-bg)' :
                          isProduction ? 'var(--status-info-bg)' :
                          isInventory ? 'var(--status-warning-bg)' :
                          'var(--card-subtle)',
                      }}
                    >
                      {isProduction && <Cpu className="h-3.5 w-3.5" style={{ color: 'var(--status-info-text)' }} />}
                      {isFinance    && <IndianRupee className="h-3.5 w-3.5" style={{ color: 'var(--status-success-text)' }} />}
                      {isInventory  && <Boxes className="h-3.5 w-3.5" style={{ color: 'var(--status-warning-text)' }} />}
                      {!isProduction && !isFinance && !isInventory && <ClipboardList className="h-3.5 w-3.5" style={{ color: 'var(--muted-foreground)' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                        {formatLogTitle(log.action, log.entity)}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        Performed by {log.user}
                      </p>
                    </div>
                    <span className="text-[10px] shrink-0 mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      {log.timeAgo || 'Recent'}
                    </span>
                  </div>
                );
              })
            )}
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
              {data.aiRecommendations.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl bg-secondary/5 mt-2">
                  No insights available yet.
                </div>
              ) : (
                data.aiRecommendations.map((insight, i) => (
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
                ))
              )}
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
