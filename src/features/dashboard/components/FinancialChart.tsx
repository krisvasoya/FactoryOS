'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { IndianRupee } from 'lucide-react';
import { DashboardData } from '../hooks/useDashboard';

const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });

interface FinancialChartProps {
  data: DashboardData;
}

export function FinancialChart({ data }: FinancialChartProps) {
  const hasFinanceData = data.financialData && data.financialData.some(d => d.Revenue > 0 || d.Expenses > 0);

  const tooltipStyle = {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '11px',
    color: 'var(--foreground)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  };

  return (
    <div className="card p-5">
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
            <p className="text-[10px] text-muted-foreground max-w-xs mx-auto mt-0.5">
              Invoices and expenses registered for this month will generate real-time revenue audits here.
            </p>
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
  );
}
