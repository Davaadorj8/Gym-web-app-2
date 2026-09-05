'use client';

import React from 'react';
import { KeyRound, ShieldAlert, Wrench } from 'lucide-react';
import { StatCard } from '../StatCard';
import { LockerCustomStatus } from '@/features/lockers';

interface LockersTabProps {
  totalLockers: number;
  lockersOccupiedCount: number;
  lockerServiceStatuses: Record<string | number, LockerCustomStatus>;
}

export function LockersTab({
  totalLockers,
  lockersOccupiedCount,
  lockerServiceStatuses,
}: LockersTabProps) {
  const serviceCount = Object.keys(lockerServiceStatuses).length;
  const availableCount = Math.max(0, totalLockers - lockersOccupiedCount - serviceCount);
  const utilizationRate =
    totalLockers > 0 ? Math.round((lockersOccupiedCount / totalLockers) * 100) : 0;

  return (
    <div className="space-y-4 font-sans animate-in fade-in duration-150">
      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Locker Capacity"
          value={`${totalLockers} units`}
          subtitle="Total gym locker installation"
          icon={KeyRound}
          variant="default"
        />
        <StatCard
          title="Currently Occupied"
          value={`${lockersOccupiedCount} lockers`}
          subtitle={`${utilizationRate}% occupancy rate`}
          icon={KeyRound}
          variant="info"
        />
        <StatCard
          title="Available Lockers"
          value={`${availableCount} lockers`}
          subtitle="Ready for check-in assignment"
          icon={KeyRound}
          variant="success"
        />
        <StatCard
          title="Under Maintenance / Out"
          value={`${serviceCount} lockers`}
          subtitle="Repair, clean, or lost key"
          icon={Wrench}
          variant={serviceCount > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Floor Overview Box */}
      <div className="bg-[#0B132B]/80 border border-border/80 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
            Locker Status Overview
          </h3>
          <span className="text-[10px] font-mono text-muted-foreground">
            Utilization Rate: {utilizationRate}%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 bg-[#070D1E] border border-emerald-500/30 rounded-lg">
            <span className="text-[10px] text-emerald-400 uppercase font-bold">Available</span>
            <div className="text-base font-bold text-foreground mt-0.5">{availableCount} Units</div>
            <p className="text-[9px] text-muted-foreground">Ready for active check-ins</p>
          </div>

          <div className="p-3 bg-[#070D1E] border border-sky-500/30 rounded-lg">
            <span className="text-[10px] text-sky-400 uppercase font-bold">Occupied</span>
            <div className="text-base font-bold text-foreground mt-0.5">{lockersOccupiedCount} Units</div>
            <p className="text-[9px] text-muted-foreground">Assigned to active members</p>
          </div>

          <div className="p-3 bg-[#070D1E] border border-amber-500/30 rounded-lg">
            <span className="text-[10px] text-amber-400 uppercase font-bold">Under Maintenance</span>
            <div className="text-base font-bold text-foreground mt-0.5">{serviceCount} Units</div>
            <p className="text-[9px] text-muted-foreground">Flagged out-of-service</p>
          </div>
        </div>
      </div>
    </div>
  );
}
