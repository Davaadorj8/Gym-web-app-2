'use client';

import React from 'react';
import { KeyRound, Wrench } from 'lucide-react';
import { StatCard } from '../StatCard';

interface LockerOverviewCardProps {
  totalLockers: number;
  occupiedCount: number;
  availableCount: number;
  outOfServiceCount: number;
  occupancyRate: number;
}

export function LockerOverviewCard({
  totalLockers,
  occupiedCount,
  availableCount,
  outOfServiceCount,
  occupancyRate,
}: LockerOverviewCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-sans">
      <StatCard
        title="Total Locker Floor Capacity"
        value={`${totalLockers} units`}
        subtitle="Physical locker installations"
        icon={KeyRound}
        variant="default"
      />
      <StatCard
        title="Occupied Lockers"
        value={`${occupiedCount} lockers`}
        subtitle={`${occupancyRate}% utilization rate`}
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
        title="Under Maintenance / Service"
        value={`${outOfServiceCount} lockers`}
        subtitle="Repair, cleaning, or lost key"
        icon={Wrench}
        variant={outOfServiceCount > 0 ? 'warning' : 'default'}
      />
    </div>
  );
}
