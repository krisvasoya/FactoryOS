'use client';

import React from 'react';
import { BarChart2 } from 'lucide-react';
import { DashboardData } from '../hooks/useDashboard';

interface AiInsightsProps {
  data: DashboardData;
}

export function AiInsights({ data }: AiInsightsProps) {
  return (
    <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
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
  );
}
