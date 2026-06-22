'use client';

import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { DashboardSkeleton } from '@/components/skeleton';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { OverviewCards } from '@/features/dashboard/components/OverviewCards';
import { FinancialChart } from '@/features/dashboard/components/FinancialChart';
import { ProductionChart } from '@/features/dashboard/components/ProductionChart';
import { ActivityList } from '@/features/dashboard/components/ActivityList';
import { AiInsights } from '@/features/dashboard/components/AiInsights';
import { MachineStatus } from '@/features/dashboard/components/MachineStatus';
import { OperationsHealth } from '@/features/dashboard/components/OperationsHealth';

export default function DashboardPage() {
  const {
    data,
    loading,
    refreshing,
    handleRefresh,
    loadDashboardData,
    formatLogTitle,
    computedChanges,
  } = useDashboard();

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
      <OverviewCards data={data} computedChanges={computedChanges} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <FinancialChart data={data} />
        </div>
        <ProductionChart data={data} />
      </div>

      {/* Bottom Row: Activity + AI Insights + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ActivityList data={data} formatLogTitle={formatLogTitle} />
        <div className="space-y-4">
          <AiInsights data={data} />
          <MachineStatus data={data} />
          <OperationsHealth data={data} />
        </div>
      </div>
    </div>
  );
}
