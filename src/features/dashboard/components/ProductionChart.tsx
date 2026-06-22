'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Activity } from 'lucide-react';
import { DashboardData } from '../hooks/useDashboard';

const LineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((mod) => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });

interface ProductionChartProps {
  data: DashboardData;
}

export function ProductionChart({ data }: ProductionChartProps) {
  const hasProductionData = data.productionData && data.productionData.some(d => d.Target > 0 || d.Completed > 0);

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
            <p className="text-[10px] text-muted-foreground max-w-xs mx-auto mt-0.5">
              Create and complete manufacturing runs in the production board to display weekly target metrics.
            </p>
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
  );
}
