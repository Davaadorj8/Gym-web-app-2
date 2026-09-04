'use client';

import React, { useState } from 'react';
import { Activity, Clock, Users } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { StatCard } from '../StatCard';
import { calculateWeeklyDistribution, calculateHourlyTraffic } from './analytics.types';

interface OperationalTabProps {
  checkInLogs: { timestamp: string }[];
  totalMembersCount: number;
  currentCheckedInCount: number;
}

export function OperationalTab({ checkInLogs, totalMembersCount, currentCheckedInCount }: OperationalTabProps) {
  const [trafficViewMode, setTrafficViewMode] = useState<'weekly' | 'hourly'>('weekly');

  const weeklyData = calculateWeeklyDistribution(checkInLogs);
  const hourlyData = calculateHourlyTraffic(checkInLogs);

  const totalCheckIns = checkInLogs.length;
  const peakHour = hourlyData.reduce((max, cur) => (cur.count > max.count ? cur : max), { time: '18:00', count: 0 });

  return (
    <div className="space-y-4 font-sans animate-in fade-in duration-150">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          title="Total Check-Ins Processed"
          value={totalCheckIns}
          subtitle="All historical check-in scans"
          icon={Activity}
          variant="default"
        />
        <StatCard
          title="Currently Checked In"
          value={currentCheckedInCount}
          subtitle={`Out of ${totalMembersCount} total members`}
          icon={Users}
          variant="success"
        />
        <StatCard
          title="Peak Traffic Hour"
          value={peakHour.time}
          subtitle={`${peakHour.count} peak check-ins recorded`}
          icon={Clock}
          variant="info"
        />
      </div>

      {/* Traffic Analysis Switchable Chart */}
      <div className="bg-[#0B132B]/80 border border-border/80 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
              Traffic Analysis
            </h3>
            <p className="text-[10px] text-muted-foreground font-mono">
              {trafficViewMode === 'weekly' ? 'Weekly Check-in Frequency (Mon-Sun)' : 'Hourly Member Check-in Density'}
            </p>
          </div>

          <div className="flex items-center bg-[#070D1E] border border-border/80 rounded-lg p-0.5 font-mono text-[10px]">
            <button
              type="button"
              onClick={() => setTrafficViewMode('weekly')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                trafficViewMode === 'weekly' ? 'bg-[#D4FF00] text-black font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setTrafficViewMode('hourly')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                trafficViewMode === 'hourly' ? 'bg-[#D4FF00] text-black font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Hourly
            </button>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {trafficViewMode === 'weekly' ? (
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070D1E', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="checkIns" fill="#D4FF00" radius={[4, 4, 0, 0]} name="Check-ins" />
              </BarChart>
            ) : (
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070D1E', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#38bdf8" fillOpacity={1} fill="url(#trafficGrad)" name="Check-ins" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
