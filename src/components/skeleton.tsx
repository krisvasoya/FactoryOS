import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-6 w-32 skeleton rounded-md" />
          <div className="h-4 w-64 skeleton rounded-md" />
        </div>
        <div className="h-9 w-20 skeleton rounded-xl" />
      </div>

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3.5 w-20 skeleton rounded-md" />
                <div className="h-7 w-24 skeleton rounded-md" />
              </div>
              <div className="h-8 w-8 skeleton rounded-lg" />
            </div>
            <div className="h-3 w-28 skeleton rounded-md" />
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Financial chart skeleton */}
        <div className="lg:col-span-2 card p-5 space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-32 skeleton rounded-md" />
            <div className="h-3.5 w-64 skeleton rounded-md" />
          </div>
          <div className="h-[220px] w-full skeleton rounded-xl" />
          <div className="flex gap-4">
            <div className="h-3.5 w-16 skeleton rounded-md" />
            <div className="h-3.5 w-16 skeleton rounded-md" />
          </div>
        </div>

        {/* Production chart skeleton */}
        <div className="card p-5 space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-32 skeleton rounded-md" />
            <div className="h-3.5 w-48 skeleton rounded-md" />
          </div>
          <div className="h-[220px] w-full skeleton rounded-xl" />
          <div className="flex gap-4">
            <div className="h-3.5 w-16 skeleton rounded-md" />
            <div className="h-3.5 w-16 skeleton rounded-md" />
          </div>
        </div>
      </div>

      {/* Bottom Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activities */}
        <div className="lg:col-span-2 card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-4 w-32 skeleton rounded-md" />
              <div className="h-3.5 w-48 skeleton rounded-md" />
            </div>
            <div className="h-5 w-5 skeleton rounded" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="h-7 w-7 rounded-full skeleton shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-2/5 skeleton rounded-md" />
                  <div className="h-3 w-1/4 skeleton rounded-md" />
                </div>
                <div className="h-3.5 w-12 skeleton rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* AI & Status skeleton widgets */}
        <div className="space-y-4">
          <div className="card p-5 space-y-3">
            <div className="h-4 w-28 skeleton rounded-md" />
            <div className="space-y-2">
              <div className="h-10 w-full skeleton rounded-lg" />
              <div className="h-10 w-full skeleton rounded-lg" />
              <div className="h-10 w-full skeleton rounded-lg" />
            </div>
          </div>
          <div className="card p-5 space-y-3">
            <div className="h-4 w-28 skeleton rounded-md" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-12 skeleton rounded-lg" />
              <div className="h-12 skeleton rounded-lg" />
              <div className="h-12 skeleton rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section skeleton */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 skeleton rounded-md" />
          <div className="h-4 w-80 skeleton rounded-md" />
        </div>
        <div className="h-10 w-32 skeleton rounded-xl" />
      </div>

      {/* Control panel search bar skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-full max-w-sm skeleton rounded-xl" />
      </div>

      {/* Table skeleton structure */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-secondary/10 p-4">
          <div className="grid grid-cols-5 gap-4">
            <div className="h-4 w-24 skeleton rounded" />
            <div className="h-4 w-20 skeleton rounded" />
            <div className="h-4 w-16 skeleton rounded" />
            <div className="h-4 w-20 skeleton rounded" />
            <div className="h-4 w-16 skeleton rounded" />
          </div>
        </div>
        <div className="divide-y divide-border/60">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4">
              <div className="grid grid-cols-5 gap-4 items-center">
                <div className="space-y-2">
                  <div className="h-4 w-36 skeleton rounded" />
                  <div className="h-3 w-20 skeleton rounded" />
                </div>
                <div className="h-4 w-24 skeleton rounded" />
                <div className="h-5 w-12 skeleton rounded-lg" />
                <div className="h-4 w-16 skeleton rounded" />
                <div className="h-5 w-16 skeleton rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
