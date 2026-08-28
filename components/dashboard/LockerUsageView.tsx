'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  KeyRound,
  Lock,
  Unlock,
  Clock,
  Database,
  Search,
  ShieldCheck,
  User,
} from 'lucide-react';
import { GymMember, LockerLog } from '@/lib/types';
import { Button, Card, Badge, Input, TabsList, type TabItem } from '@/components/ui';
import { useDashboard } from '@/lib/orchestration';
import { calculateOccupancyMetrics } from '@/lib/services';

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
  onNavigateToCheckIn,
}: LockerUsageViewProps) {
  const dashboard = useDashboard();
  const members = propMembers ?? dashboard.members;
  const logs = propLogs ?? dashboard.lockerLogs;
  const totalLockers = propTotalLockers ?? dashboard.totalLockers;

  const t = useTranslations('LockerUsage');

  // Table search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'occupied' | 'returns'>('all');

  // Currently active occupants (Checked In members who have an assigned locker)
  const activeOccupants = useMemo(() => {
    return members.filter(
      (m) => m.occupancyStatus === 'Checked In' && m.assignedLocker
    );
  }, [members]);

  const metrics = useMemo(() => {
    return calculateOccupancyMetrics(totalLockers, activeOccupants.length, dashboard.lockerStatuses);
  }, [totalLockers, activeOccupants.length, dashboard.lockerStatuses]);

  // Specific custom status counts for floor operational awareness
  const statusCounts = useMemo(() => {
    const list = Array.from({ length: totalLockers }, (_, i) => `Locker #${String(i + 1).padStart(2, '0')}`);
    const counts = {
      clean: 0,
      repair: 0,
      key_lost: 0,
      key_not_returned: 0,
      inactive: 0,
    };
    list.forEach((loc) => {
      const st = dashboard.lockerStatuses[loc];
      if (st && st in counts) {
        counts[st as keyof typeof counts]++;
      }
    });
    return counts;
  }, [totalLockers, dashboard.lockerStatuses]);

  const { occupiedCount, availableCount, outOfServiceCount, occupancyRate, totalLockers: effectiveTotalLockers } = metrics;

  // Filtered Database Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Type Filter
      if (logFilter === 'occupied' && log.eventType !== 'Checked In') return false;
      if (logFilter === 'returns' && log.eventType !== 'Checked Out') return false;

      // Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchLocker = log.lockerNumber.toLowerCase().includes(q);
      const matchName = log.memberName.toLowerCase().includes(q);
      const matchId = log.memberId.toLowerCase().includes(q);
      const matchDesc = log.eventDescription.toLowerCase().includes(q);
      return matchLocker || matchName || matchId || matchDesc;
    });
  }, [logs, logFilter, searchQuery]);

  return (
    <div id="locker-usage-root" className="space-y-6 pb-12">
      {/* Header Bar */}
      <div
        id="locker-usage-header"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h1 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
              {t('title')}
            </h1>
          </div>
          <p className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>{t('subtitle')}</span>
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5">
          {onNavigateToCheckIn && (
            <Button
              id="btn-assign-key-top"
              type="button"
              variant="primary"
              onClick={onNavigateToCheckIn}
            >
              <KeyRound className="w-4 h-4 mr-2 stroke-[2.5]" />
              <span>{t('btnAssignKey')}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Merged Status Card */}
      <Card
        id="locker-status-overview"
        className="p-6 shadow-xl relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                <Database className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">
                  {t('lockerStatusOverview')}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {t('lockerStatusBreakdown', {
                    total: effectiveTotalLockers,
                    free: availableCount,
                    occupied: occupiedCount,
                    out: outOfServiceCount,
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div id="stat-total" className="space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">{t('totalCapacity')}</span>
                <p className="text-2xl font-black text-foreground font-mono">{effectiveTotalLockers}</p>
              </div>
              <div id="stat-free" className="space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">{t('lockersAvailable')}</span>
                <p className="text-2xl font-black text-emerald-400 font-mono">{availableCount}</p>
              </div>
              <div id="stat-occupied" className="space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">{t('currentlyOccupied')}</span>
                <p className="text-2xl font-black text-sky-400 font-mono">{occupiedCount}</p>
              </div>
              <div id="stat-out" className="space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">{t('underService')}</span>
                <p className="text-2xl font-black text-amber-500 font-mono">{outOfServiceCount}</p>
              </div>
            </div>

            {/* Custom Management Status Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50 text-[10px] font-mono">
              <span className="text-muted-foreground uppercase font-bold text-[9px]">Breakdown:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Needs Clean: <strong className="ml-1 font-extrabold">{statusCounts.clean}</strong>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Repair Fix: <strong className="ml-1 font-extrabold">{statusCounts.repair}</strong>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                Key Lost: <strong className="ml-1 font-extrabold">{statusCounts.key_lost}</strong>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Key Overdue: <strong className="ml-1 font-extrabold">{statusCounts.key_not_returned}</strong>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">
                Inactive: <strong className="ml-1 font-extrabold">{statusCounts.inactive}</strong>
              </span>
            </div>
          </div>

          <div className="w-px h-24 bg-border hidden md:block mx-4" />

          <div className="space-y-4 min-w-[200px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">{t('utilizationRate')}</span>
              <span className="text-sm font-black text-sky-400 font-mono">{occupancyRate}%</span>
            </div>
            <div className="w-full bg-muted h-3 rounded-full overflow-hidden border border-border">
              <div
                className="bg-sky-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-mono text-right">
              Based on active key issuance
            </p>
          </div>
        </div>
      </Card>

      {/* ================= Current Active Locker Occupants ================= */}
      <Card
        id="card-active-occupants"
        className="p-5 sm:p-6 shadow-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h2 className="text-sm sm:text-base font-extrabold text-foreground">
                {t('activeOccupantsTitle')}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {t('activeOccupantsSubtitle')}
            </p>
          </div>

          <Badge variant="primary">
            {t('realtimeOccupantsCount', { count: activeOccupants.length })}
          </Badge>
        </div>

        {activeOccupants.length === 0 ? (
          /* Empty state for Active Occupants */
          <div
            id="empty-active-occupants"
            className="bg-background border border-border rounded-2xl py-12 px-6 text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-muted border border-border mx-auto flex items-center justify-center text-muted-foreground">
              <KeyRound className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              {t('noOccupants')}
            </h3>
            <p className="text-xs text-muted-foreground font-mono max-w-md mx-auto">
              When receptionists check in members at the desk, their locker keys appear here in real-time.
            </p>
          </div>
        ) : (
          /* Active Occupants Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 pt-2">
            {activeOccupants.map((occ) => (
              <div
                key={occ.id}
                id={`occupant-card-${occ.id}`}
                className="bg-background border border-border hover:border-primary/60 rounded-2xl p-4 transition-all shadow-md flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Photo or User Avatar */}
                  <div className="w-11 h-11 rounded-full bg-muted border border-border shrink-0 overflow-hidden flex items-center justify-center">
                    {occ.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={occ.photoUrl}
                        alt={`${occ.firstName} ${occ.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground uppercase truncate">
                        {occ.firstName} {occ.lastName}
                      </h4>
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className="text-sky-400 font-bold">{occ.id}</span>
                      <span>•</span>
                      <span>{occ.lastCheckInTime?.split(' ')[1] || 'Just now'}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-extrabold">
                    <KeyRound className="w-3 h-3 text-sky-400" />
                    <span>{occ.assignedLocker}</span>
                  </span>
                  <Badge variant="success" className="text-[10px]">
                    Floor Active
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ================= Database Locker Usage Log ================= */}
      <Card
        id="card-database-log"
        className="p-5 sm:p-6 shadow-xl space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <h2 className="text-sm sm:text-base font-extrabold text-foreground">
                {t('databaseLogsTitle')}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {t('databaseLogsSubtitle')}
            </p>
          </div>

          {/* Search bar & Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="min-w-[240px]">
              <Input
                id="input-search-locker-logs"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                icon={<Search className="w-3.5 h-3.5 text-muted-foreground" />}
              />
            </div>

            <TabsList
              tabs={[
                { id: 'all', label: t('filterAll') },
                { id: 'occupied', label: t('filterOccupied') },
                { id: 'returns', label: t('filterReturns') },
              ]}
              activeTab={logFilter}
              onTabChange={(tab) => setLogFilter(tab as any)}
              variant="boxed"
            />
          </div>
        </div>

        {/* Database Table */}
        <div className="overflow-x-auto rounded-xl border border-border">
          {filteredLogs.length === 0 ? (
            /* Empty table state */
            <div className="py-12 text-center text-xs font-mono text-muted-foreground space-y-2 bg-background">
              <Database className="w-6 h-6 text-muted-foreground/50 mx-auto mb-1 stroke-[1.5]" />
              <p>{t('noLogs')}</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-muted text-muted-foreground text-[10px] uppercase font-bold border-b border-border">
                  <th className="py-3 px-4">{t('colLockerNum')}</th>
                  <th className="py-3 px-4">{t('colAthlete')}</th>
                  <th className="py-3 px-4">{t('colEventDetails')}</th>
                  <th className="py-3 px-4">{t('colTimestamp')}</th>
                  <th className="py-3 px-4">{t('colActionType')}</th>
                  <th className="py-3 px-4 text-right">{t('colStaff')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredLogs.map((log) => {
                  const isCheckIn = log.eventType === 'Checked In';

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      {/* Locker Key # */}
                      <td className="py-3.5 px-4 font-bold">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono text-xs">
                          <KeyRound className="w-3 h-3 text-sky-400" />
                          <span>{log.lockerNumber}</span>
                        </span>
                      </td>

                      {/* Athlete / Member */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-foreground uppercase tracking-wide">
                          {log.memberName}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          {log.memberId}
                        </div>
                      </td>

                      {/* Event Description */}
                      <td className="py-3.5 px-4 text-muted-foreground">
                        <span className="font-medium text-foreground">{log.eventDescription}</span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {log.timeFormatted}
                      </td>

                      {/* Key Status Badge */}
                      <td className="py-3.5 px-4">
                        {isCheckIn ? (
                          <Badge variant="success">
                            Key Issued (In)
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Key Returned (Out)
                          </Badge>
                        )}
                      </td>

                      {/* Staff Logged */}
                      <td className="py-3.5 px-4 text-right">
                        {log.staffRole === 'admin' ||
                        log.staffLogged?.toLowerCase().includes('admin') ||
                        log.staffLogged === 'Admin' ? (
                          <Badge
                            id={`staff-logged-badge-${log.id}`}
                            variant="primary"
                            className="font-mono font-black uppercase tracking-wider"
                          >
                            <ShieldCheck className="w-3 h-3 mr-1 text-primary-foreground" />
                            <span>{log.staffLogged || 'Admin'}</span>
                          </Badge>
                        ) : (
                          <Badge
                            id={`staff-logged-badge-${log.id}`}
                            variant="info"
                            className="font-mono font-black uppercase tracking-wider"
                          >
                            <User className="w-3 h-3 mr-1 text-sky-400" />
                            <span>{log.staffLogged || 'Staff'}</span>
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
