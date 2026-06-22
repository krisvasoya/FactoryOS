'use client';

import React from 'react';
import { ClipboardList, Cpu, IndianRupee, Boxes } from 'lucide-react';
import { DashboardData } from '../hooks/useDashboard';

interface ActivityListProps {
  data: DashboardData;
  formatLogTitle: (action: string, entity: string) => string;
}

export function ActivityList({ data, formatLogTitle }: ActivityListProps) {
  return (
    <div className="lg:col-span-2 card p-5 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
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
  );
}
