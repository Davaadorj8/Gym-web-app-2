'use client';

import React from 'react';
import { Users, Clock } from 'lucide-react';
import { StatCard } from '../StatCard';

interface CapacityWaitlistWidgetProps {
  currentCheckedInCount: number;
  totalCapacity?: number;
  waitlistQueue?: unknown[];
}

export function CapacityWaitlistWidget({
  currentCheckedInCount,
  totalCapacity = 50,
  waitlistQueue = [],
}: CapacityWaitlistWidgetProps) {
  const occupancyRate = Math.round((currentCheckedInCount / totalCapacity) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
      <StatCard
        title="Live Gym Occupancy"
        value={`${currentCheckedInCount} / ${totalCapacity}`}
        subtitle={`${occupancyRate}% total facility capacity filled`}
        icon={Users}
        variant={occupancyRate >= 90 ? 'danger' : occupancyRate >= 70 ? 'warning' : 'success'}
      />
      <StatCard
        title="Waitlist Queue"
        value={`${waitlistQueue.length} waiting`}
        subtitle="Members waiting for locker or gym slot"
        icon={Clock}
        variant={waitlistQueue.length > 0 ? 'warning' : 'default'}
      />
      <StatCard
        title="Available Gym Capacity"
        value={`${Math.max(0, totalCapacity - currentCheckedInCount)} slots`}
        subtitle="Ready for instant check-in"
        icon={Users}
        variant="info"
      />
    </div>
  );
}
