'use client';

import React from 'react';
import { Cpu } from 'lucide-react';
import { DashboardData } from '../hooks/useDashboard';

interface MachineStatusProps {
  data: DashboardData;
}

export function MachineStatus({ data }: MachineStatusProps) {
  return (
    <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
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
  );
}
