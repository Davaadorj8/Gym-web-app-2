'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { LockerCustomStatus } from '@/features/lockers';
import { useDashboard } from '@/lib/orchestration';
import { LockerCapacityCard } from './LockerCapacityCard';
import { LockerStatusUpdateForm } from './LockerStatusUpdateForm';

interface LockerManagementTabProps {
  showToast: (msg: string) => void;
}

export function LockerManagementTab({ showToast }: LockerManagementTabProps) {
  const t = useTranslations('Inventory');
  const dashboard = useDashboard();
  const totalLockers = dashboard.totalLockers;

  const handleUpdateLockerStatus = (
    lockerNum: string,
    status: LockerCustomStatus,
    notes?: string
  ) => {
    dashboard.updateLockerStatus(lockerNum, status, notes);
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Capacity Configuration */}
        <LockerCapacityCard
          totalLockers={totalLockers}
          onSaveTotalLockers={(count) => dashboard.saveTotalLockers(count)}
          showToast={showToast}
        />

        {/* Status Maintenance Form */}
        <LockerStatusUpdateForm
          totalLockers={totalLockers}
          onUpdateLockerStatus={handleUpdateLockerStatus}
          showToast={showToast}
        />
      </div>

      {/* Overview Grid */}
      <div className="bg-[#070D1E] border border-border/80 rounded-xl p-4 space-y-3 font-mono text-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground border-b border-border/80 pb-2">
          Current Locker Floor Configuration Summary
        </h3>
        <p className="text-muted-foreground text-[11px]">
          There are currently <strong className="text-[#D4FF00]">{totalLockers}</strong> active locker floor units configured. Use the forms above or the Locker Usage view for detailed status overlays.
        </p>
      </div>
    </div>
  );
}
