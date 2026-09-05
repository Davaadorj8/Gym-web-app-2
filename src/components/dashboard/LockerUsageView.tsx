'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { KeyRound } from 'lucide-react';
import { GymMember } from '@/lib/types';
import { LockerLog, calculateOccupancyMetrics } from '@/features/lockers';
import { useDashboard } from '@/lib/orchestration';
import {
  LockerOverviewCard,
  LockerFloorGrid,
  LockerLogsTable,
} from './locker-usage';

interface LockerUsageViewProps {
  members?: GymMember[];
  logs?: LockerLog[];
  totalLockers?: number;
  onNavigateToCheckIn?: () => void;
  onNavigateToInventory?: () => void;
}

export default function LockerUsageView({
  members: propMembers,
  logs: propLogs,
  totalLockers: propTotalLockers,
}: LockerUsageViewProps) {
  const dashboard = useDashboard();
  const members = propMembers ?? dashboard.members;
  const logs = propLogs ?? dashboard.lockerLogs;
  const totalLockers = propTotalLockers ?? dashboard.totalLockers;

  const t = useTranslations('LockerUsage');

  const [selectedLockerNumber, setSelectedLockerNumber] = useState<string | null>(null);

  const activeOccupants = useMemo(() => {
    return members.filter((m) => m.occupancyStatus === 'Checked In' && m.assignedLocker);
  }, [members]);

  const lockerList = useMemo(() => {
    return Array.from({ length: totalLockers }, (_, i) => {
      const numStr = String(i + 1).padStart(2, '0');
      const lockerName = `Locker #${numStr}`;
      const occupant = activeOccupants.find((o) => o.assignedLocker === lockerName || o.assignedLocker === numStr);
      const customStatus = dashboard.lockerStatuses[lockerName] || 'available';

      return {
        name: lockerName,
        shortName: `L${numStr}`,
        occupant: occupant ? { id: occupant.id, name: `${occupant.firstName} ${occupant.lastName}`.trim() } : null,
        status: occupant ? 'occupied' : customStatus,
      };
    });
  }, [totalLockers, activeOccupants, dashboard.lockerStatuses]);

  const metrics = useMemo(() => {
    return calculateOccupancyMetrics(totalLockers, activeOccupants.length, dashboard.lockerStatuses);
  }, [totalLockers, activeOccupants.length, dashboard.lockerStatuses]);

  return (
    <div id="locker-usage-view-root" className="w-full space-y-4 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {t('title') || 'Locker Floor & Occupancy Management'}
        </h1>
        <p className="text-xs text-muted-foreground font-mono">
          Monitor physical locker occupancy, floor status layout, and key return audit histories.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <LockerOverviewCard
        totalLockers={totalLockers}
        occupiedCount={metrics.occupiedCount}
        availableCount={metrics.availableCount}
        outOfServiceCount={metrics.outOfServiceCount}
        occupancyRate={metrics.occupancyRate}
      />

      {/* Locker Floor Layout Grid */}
      <LockerFloorGrid
        lockerList={lockerList}
        selectedLockerNumber={selectedLockerNumber}
        onSelectLocker={(name) => setSelectedLockerNumber(name)}
      />

      {/* Audit Logs Table */}
      <div className="bg-[#0B132B]/80 border border-border/80 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border/80 pb-2.5 font-mono">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#D4FF00]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Locker Key &amp; Access Audit Logs
            </h3>
          </div>
          <span className="text-[10px] text-muted-foreground">{logs.length} events logged</span>
        </div>

        <LockerLogsTable logs={logs} />
      </div>
    </div>
  );
}
