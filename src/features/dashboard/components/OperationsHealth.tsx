'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import { DashboardData } from '../hooks/useDashboard';

interface OperationsHealthProps {
  data: DashboardData;
}

export function OperationsHealth({ data }: OperationsHealthProps) {
  return (
    <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
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
  );
}
