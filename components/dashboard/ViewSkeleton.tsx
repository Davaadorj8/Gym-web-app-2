'use client';

import React from 'react';

interface ViewSkeletonProps {
  title?: string;
  tab?: string;
}

export function ViewSkeleton({ title, tab }: ViewSkeletonProps) {
  const displayTitle =
    title ||
    (tab === 'directory'
      ? 'Member Directory'
      : tab === 'locker'
      ? 'Locker Assignment'
      : tab === 'checkin-desk'
      ? 'Check-In Desk'
      : tab === 'inventory'
      ? 'Nutrient Inventory'
      : tab === 'analytics' || tab === 'dashboard'
      ? 'Analytics & Insights'
      : tab === 'approvals'
      ? 'Staff Approvals'
      : tab === 'registration'
      ? 'Member Registration'
      : 'Loading Console...');

  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Top Header Placeholder */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/60">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted rounded-md" />
          <div className="h-3.5 w-72 bg-muted/60 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-muted/80 rounded-lg" />
          <div className="h-9 w-28 bg-muted/80 rounded-lg" />
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-card border border-border/60 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 bg-muted/80 rounded" />
              <div className="h-8 w-8 bg-muted rounded-lg" />
            </div>
            <div className="h-7 w-20 bg-muted rounded-md" />
            <div className="h-3 w-32 bg-muted/60 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Table / Grid Placeholder */}
      <div className="p-4 rounded-xl bg-card border border-border/60 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="h-5 w-36 bg-muted rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-muted/80 rounded-lg" />
            <div className="h-8 w-32 bg-muted/80 rounded-lg" />
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-muted/80 rounded" />
                  <div className="h-3 w-20 bg-muted/50 rounded" />
                </div>
              </div>
              <div className="h-4 w-24 bg-muted/60 rounded" />
              <div className="h-4 w-16 bg-muted/60 rounded" />
              <div className="h-6 w-20 bg-muted/80 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ViewSkeleton;
