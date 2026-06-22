'use client';

import React from 'react';
import { TrendingUp, TrendingDown, IndianRupee, ShoppingBag, Hourglass, Boxes } from 'lucide-react';
import { DashboardData } from '../hooks/useDashboard';

interface OverviewCardsProps {
  data: DashboardData;
  computedChanges: {
    revenueChangeText: string;
    revenuePositive: boolean | 'neutral';
    profitChangeText: string;
    profitPositive: boolean | 'neutral';
    ordersChangeText: string;
    ordersPositive: boolean | 'neutral';
    pendingChangeText: string;
    pendingPositive: boolean | 'neutral';
  };
}

export function OverviewCards({ data, computedChanges }: OverviewCardsProps) {
  const metrics = [
    {
      label: 'Total Revenue',
      value: `₹${data.metrics.monthlySales.toLocaleString()}`,
      change: computedChanges.revenueChangeText,
      positive: computedChanges.revenuePositive,
      icon: IndianRupee,
      iconColor: 'var(--status-success-text)',
      iconBg: 'var(--status-success-bg)',
    },
    {
      label: 'Net Profit',
      value: `₹${data.metrics.netProfit.toLocaleString()}`,
      change: computedChanges.profitChangeText,
      positive: computedChanges.profitPositive,
      icon: TrendingUp,
      iconColor: 'var(--status-success-text)',
      iconBg: 'var(--status-success-bg)',
    },
    {
      label: 'Total Orders',
      value: `${data.production.pending + data.production.active + data.production.completed}`,
      change: computedChanges.ordersChangeText,
      positive: computedChanges.ordersPositive,
      icon: ShoppingBag,
      iconColor: 'var(--status-info-text)',
      iconBg: 'var(--status-info-bg)',
    },
    {
      label: 'Pending Orders',
      value: `${data.production.pending}`,
      change: computedChanges.pendingChangeText,
      positive: computedChanges.pendingPositive,
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

  return (
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
  );
}
