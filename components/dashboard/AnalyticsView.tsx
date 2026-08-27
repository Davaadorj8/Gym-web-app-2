'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Users,
  Award,
  RefreshCw,
  Calendar,
  DollarSign,
  Search,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { GymMember, CategoryTarget, AuthUser, BuiltPlan } from '@/lib/types';
import { Card, Badge, Input } from '@/components/ui';
import { useDashboard } from '@/lib/orchestration';
import { formatCurrency, CURRENCY_SYMBOL, cn } from '@/lib/utils';
import {
  calculateTotalMembershipValue,
  calculateWeeklyDistribution,
  calculateMembersByPlanTier,
  aggregateExtensionMetrics,
  calculateHourlyTraffic,
} from '@/lib/services';

interface AnalyticsViewProps {
  members?: GymMember[];
  plans?: BuiltPlan[];
  currentUser?: AuthUser;
}

export default function AnalyticsView({
  members: propMembers,
  plans: propPlans,
  currentUser: propCurrentUser,
}: AnalyticsViewProps) {
  const dashboard = useDashboard();
  const members = propMembers ?? dashboard.members;
  const plans = propPlans ?? dashboard.plans;
  const currentUser = propCurrentUser ?? dashboard.currentUser;

  const t = useTranslations('Analytics');
  const isAdmin = !currentUser || currentUser.role === 'admin';
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'under18' | 'over18' | 'organization'>('all');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<'all' | '1' | '3' | '6' | '12' | 'other'>('all');
  const [trafficViewMode, setTrafficViewMode] = useState<'weekly' | 'hourly'>('weekly');

  // Domain Calculations via Services
  const totalMembershipValue = useMemo(() => {
    return calculateTotalMembershipValue(members, plans);
  }, [members, plans]);

  // Total check-ins logged
  const totalCheckInsLogged = useMemo(() => {
    return members.reduce((acc, m) => {
      return acc + (m.lastCheckInTime ? 1 : 0) + (m.occupancyStatus === 'Checked In' ? 1 : 0);
    }, 0);
  }, [members]);

  // Active membership count & retention rate
  const activeMembersCount = useMemo(() => {
    return members.filter((m) => m.status === 'Active').length;
  }, [members]);

  const retentionRate = useMemo(() => {
    if (members.length === 0) return '0%';
    const pct = Math.round((activeMembersCount / members.length) * 100);
    return `${pct}%`;
  }, [members, activeMembersCount]);

  // Weekly Check-in Distribution via domain service
  const weeklyDistribution = useMemo(() => {
    return calculateWeeklyDistribution(members);
  }, [members]);

  // Plan Revenue distribution via domain service
  const hourlyTraffic = useMemo(() => {
    return calculateHourlyTraffic(members);
  }, [members]);

  // Operational Plan Distribution via domain service
  const membersByPlanTier = useMemo(() => {
    return calculateMembersByPlanTier(members);
  }, [members]);

  // Extension Metrics and aggregated logs via domain service
  const extensionSummary = useMemo(() => {
    return aggregateExtensionMetrics(members);
  }, [members]);

  const {
    allLogs: allExtensionLogs,
    uniqueMembersCount: uniqueExtendedMemberCount,
    renewalPercentage,
    totalTransactions: totalExtensionTransactions,
    totalRevenue: totalExtensionRevenue,
    topPeriodLabel: topExtensionPeriod,
    categoryBreakdown,
    periodBreakdown,
  } = extensionSummary;

  // Filtered Extension Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return allExtensionLogs.filter((log) => {
      const q = searchMemberQuery.toLowerCase();
      const matchesSearch =
        log.memberName.toLowerCase().includes(q) ||
        log.memberId.toLowerCase().includes(q);

      const matchesCat =
        selectedCategoryFilter === 'all' || log.memberCategory === selectedCategoryFilter;

      const matchesPeriod =
        selectedPeriodFilter === 'all' ||
        (selectedPeriodFilter === 'other'
          ? ![1, 3, 6, 12].includes(log.monthsAdded)
          : log.monthsAdded === Number(selectedPeriodFilter));

      return matchesSearch && matchesCat && matchesPeriod;
    });
  }, [allExtensionLogs, searchMemberQuery, selectedCategoryFilter, selectedPeriodFilter]);

  // Category & Period Chart Data arrays for Recharts
  const categoryChartData = useMemo(() => [
    { name: 'Under 18', count: categoryBreakdown.under18.count, revenue: categoryBreakdown.under18.revenue, fill: '#3b82f6' },
    { name: 'Over 18', count: categoryBreakdown.over18.count, revenue: categoryBreakdown.over18.revenue, fill: '#6366f1' },
    { name: 'Organization', count: categoryBreakdown.organization.count, revenue: categoryBreakdown.organization.revenue, fill: '#10b981' },
  ], [categoryBreakdown]);

  const periodChartData = useMemo(() => [
    { name: '1 Mo', count: periodBreakdown.m1.count, pct: periodBreakdown.m1.pct, fill: '#38bdf8' },
    { name: '3 Mo', count: periodBreakdown.m3.count, pct: periodBreakdown.m3.pct, fill: '#60a5fa' },
    { name: '6 Mo', count: periodBreakdown.m6.count, pct: periodBreakdown.m6.pct, fill: '#818cf8' },
    { name: '12 Mo', count: periodBreakdown.m12.count, pct: periodBreakdown.m12.pct, fill: '#a78bfa' },
    { name: 'Other', count: periodBreakdown.other.count, pct: periodBreakdown.other.pct, fill: '#94a3b8' },
  ], [periodBreakdown]);

  return (
    <div id="analytics-view-root" className="space-y-8 pb-16">
      {/* ================= SECTION 1: TOP KPI STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Total Membership Value (or Active Roster) */}
        {isAdmin ? (
          <Card
            id="metric-total-membership-value"
            className="p-5 relative overflow-hidden shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                {t('totalMembershipValue')}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                {formatCurrency(totalMembershipValue)}
              </h2>
              <p className="text-xs font-mono font-bold text-primary mt-1">
                {t('activeSubscriptions', { count: activeMembersCount })}
              </p>
            </div>
          </Card>
        ) : (
          <Card
            id="metric-active-roster"
            className="p-5 relative overflow-hidden shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                {t('activeGymRoster')}
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight flex items-baseline gap-2">
                <span>{activeMembersCount}</span>
                <span className="text-xl font-bold text-muted-foreground">{t('athletesUnit')}</span>
              </h2>
              <p className="text-xs font-mono font-bold text-sky-400 mt-1">
                {t('activeEnrolledMembers')}
              </p>
            </div>
          </Card>
        )}

        {/* Metric 2: Total Check-ins Logged */}
        <Card
          id="metric-total-checkins"
          className="p-5 relative overflow-hidden shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              {t('totalCheckInsLogged')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight flex items-baseline gap-2">
              <span>{totalCheckInsLogged}</span>
              <span className="text-xl font-bold text-muted-foreground">{t('eventsUnit')}</span>
            </h2>
            <p className="text-xs font-mono font-bold text-sky-400 mt-1">
              {t('realFrontDeskActivity')}
            </p>
          </div>
        </Card>

        {/* Metric 3: Member Retention Rate */}
        <Card
          id="metric-retention-rate"
          className="p-5 relative overflow-hidden shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              {t('memberRetentionRate')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              {retentionRate}
            </h2>
            <p className="text-xs font-mono font-bold text-primary mt-1">
              {t('retentionSubtitle', { active: activeMembersCount, total: members.length })}
            </p>
          </div>
        </Card>
      </div>

      {/* ================= SECTION 2: CHARTS ROW (RECHARTS INTEGRATION) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Traffic Analysis (Merged Weekly & Hourly) */}
        <Card
          id="card-traffic-analysis"
          className="p-5 shadow-md space-y-4 lg:col-span-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {t('trafficAnalysisTitle', { defaultValue: 'Traffic Analysis' })}
              </h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {t('trafficAnalysisSubtitle', { defaultValue: 'Interactive trends for weekly activity and hourly occupancy' })}
              </p>
            </div>
            
            <div className="flex items-center gap-1 bg-muted/50 border border-border p-1 rounded-xl shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setTrafficViewMode('weekly')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer",
                  trafficViewMode === 'weekly' 
                    ? "bg-background text-primary shadow-sm border border-border" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t('weeklyTab', { defaultValue: 'Weekly' })}
              </button>
              <button
                type="button"
                onClick={() => setTrafficViewMode('hourly')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer",
                  trafficViewMode === 'hourly' 
                    ? "bg-background text-primary shadow-sm border border-border" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t('hourlyTab', { defaultValue: 'Hourly' })}
              </button>
            </div>
          </div>

          <div className="mt-4 h-64 w-full">
            {trafficViewMode === 'weekly' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      color: 'var(--foreground)',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${value} Check-ins`, 'Activity']}
                  />
                  <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyTraffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="hour"
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: 'monospace' }}
                    interval={3}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: 'monospace' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '0.75rem',
                      color: 'var(--foreground)',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${value} Members`, 'Occupancy']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="var(--primary)" 
                    fillOpacity={1} 
                    fill="url(#colorTraffic)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* ================= SECTION 3: EXTENSION RECORDS & ANALYTICS HEADER ================= */}
      <Card
        id="section-extension-analytics"
        className="p-6 shadow-xl space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-muted border border-border flex items-center justify-center text-primary">
              <RefreshCw className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground tracking-wide flex items-center gap-2">
                <span>{t('extensionAnalyticsTitle')}</span>
              </h2>
              <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">
                {t('extensionAnalyticsSubtitle')}
              </p>
            </div>
          </div>

          <Badge variant="primary" className="text-xs px-3 py-1.5 font-bold">
            {t('extendedAthletesBadge', { count: uniqueExtendedMemberCount })}
          </Badge>
        </div>

        {/* 4 Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-background border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                {t('extendedMembersBox')}
              </span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-extrabold text-foreground mt-2">
              {uniqueExtendedMemberCount}
            </h3>
            <p className="text-[11px] font-mono font-bold text-emerald-400 mt-0.5">
              {t('uniqueAthleteRenewals')}
            </p>
          </div>

          <div className="bg-background border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                {t('totalExtensionTransactions')}
              </span>
              <RefreshCw className="w-4 h-4 text-sky-400" />
            </div>
            <h3 className="text-2xl font-extrabold text-foreground mt-2">
              {totalExtensionTransactions}
            </h3>
            <p className="text-[11px] font-mono font-bold text-sky-400 mt-0.5">
              {t('completedRenewalEvents')}
            </p>
          </div>

          {isAdmin ? (
            <div className="bg-background border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                  {t('extensionRevenue')}
                </span>
                <DollarSign className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mt-2">
                {formatCurrency(totalExtensionRevenue)}
              </h3>
              <p className="text-[11px] font-mono font-bold text-purple-400 mt-0.5">
                {t('collectedFromExtensions')}
              </p>
            </div>
          ) : (
            <div className="bg-background border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                  {t('renewalRate')}
                </span>
                <Award className="w-4 h-4 text-sky-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mt-2">
                {renewalPercentage}
              </h3>
              <p className="text-[11px] font-mono font-bold text-sky-400 mt-0.5">
                {t('athletesWithRenewals')}
              </p>
            </div>
          )}

          <div className="bg-background border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                {t('topExtensionPeriod')}
              </span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-2xl font-extrabold text-foreground mt-2">
              {topExtensionPeriod}
            </h3>
            <p className="text-[11px] font-mono font-bold text-amber-400 mt-0.5">
              {t('mostSelectedDuration')}
            </p>
          </div>
        </div>

        {/* 2 Breakdown Charts: Extensions by Category & Period (Recharts) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Subchart 1: Extensions by Category */}
          <div className="bg-background border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {t('extensionsByCategory')}
                </h4>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Under 18 • Over 18 • Organization
                </p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {t('categoryData')}
              </Badge>
            </div>

            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '0.75rem',
                      color: 'var(--foreground)',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${value} Extensions`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-muted/40 border border-border rounded-xl p-2">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">Under 18</p>
                <p className="text-base font-extrabold text-foreground font-mono mt-0.5">{categoryBreakdown.under18.count}</p>
                {isAdmin ? (
                  <p className="text-[10px] font-mono text-emerald-400 font-bold">{formatCurrency(categoryBreakdown.under18.revenue)}</p>
                ) : (
                  <p className="text-[10px] font-mono text-sky-400 font-bold">
                    {totalExtensionTransactions === 0
                      ? '0%'
                      : `${Math.round((categoryBreakdown.under18.count / totalExtensionTransactions) * 100)}%`}
                  </p>
                )}
              </div>
              <div className="bg-muted/40 border border-border rounded-xl p-2">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">Over 18</p>
                <p className="text-base font-extrabold text-primary font-mono mt-0.5">{categoryBreakdown.over18.count}</p>
                {isAdmin ? (
                  <p className="text-[10px] font-mono text-emerald-400 font-bold">{formatCurrency(categoryBreakdown.over18.revenue)}</p>
                ) : (
                  <p className="text-[10px] font-mono text-sky-400 font-bold">
                    {totalExtensionTransactions === 0
                      ? '0%'
                      : `${Math.round((categoryBreakdown.over18.count / totalExtensionTransactions) * 100)}%`}
                  </p>
                )}
              </div>
              <div className="bg-muted/40 border border-border rounded-xl p-2">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">Organization</p>
                <p className="text-base font-extrabold text-foreground font-mono mt-0.5">{categoryBreakdown.organization.count}</p>
                {isAdmin ? (
                  <p className="text-[10px] font-mono text-emerald-400 font-bold">{formatCurrency(categoryBreakdown.organization.revenue)}</p>
                ) : (
                  <p className="text-[10px] font-mono text-sky-400 font-bold">
                    {totalExtensionTransactions === 0
                      ? '0%'
                      : `${Math.round((categoryBreakdown.organization.count / totalExtensionTransactions) * 100)}%`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Subchart 2: Extensions by Period */}
          <div className="bg-background border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {t('extensionsByPeriod')}
                </h4>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  1 Mo • 3 Mo • 6 Mo • 12 Mo
                </p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {t('durationData')}
              </Badge>
            </div>

            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '0.75rem',
                      color: 'var(--foreground)',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${value} Extensions`, 'Duration Count']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {periodChartData.map((entry, index) => (
                      <Cell key={`period-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              <div className="bg-muted/40 border border-border rounded-xl p-2">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">1 Mo</p>
                <p className="text-base font-extrabold text-sky-400 font-mono mt-0.5">{periodBreakdown.m1.count}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{periodBreakdown.m1.pct}</p>
              </div>
              <div className="bg-muted/40 border border-border rounded-xl p-2">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">3 Mo</p>
                <p className="text-base font-extrabold text-foreground font-mono mt-0.5">{periodBreakdown.m3.count}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{periodBreakdown.m3.pct}</p>
              </div>
              <div className="bg-muted/40 border border-border rounded-xl p-2">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">6 Mo</p>
                <p className="text-base font-extrabold text-foreground font-mono mt-0.5">{periodBreakdown.m6.count}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{periodBreakdown.m6.pct}</p>
              </div>
              <div className="bg-muted/40 border border-border rounded-xl p-2">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">12 Mo</p>
                <p className="text-base font-extrabold text-foreground font-mono mt-0.5">{periodBreakdown.m12.count}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{periodBreakdown.m12.pct}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECTION 4: EXTENSION AUDIT RECORDS LOG ================= */}
        <div
          id="card-extension-audit-records-log"
          className="bg-background border border-border rounded-2xl p-5 space-y-4 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                {t('auditRecordsLogTitle')}
              </h3>
              <Badge variant="primary">
                {t('recordsBadge', { count: filteredAuditLogs.length })}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[200px]">
                <Input
                  type="text"
                  placeholder={t('searchMemberPlaceholder')}
                  value={searchMemberQuery}
                  onChange={(e) => setSearchMemberQuery(e.target.value)}
                  icon={<Search className="w-3.5 h-3.5 text-muted-foreground" />}
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value as any)}
                className="bg-input border border-border text-foreground text-xs font-mono rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="all">{t('allCategories')}</option>
                <option value="under18">Under 18 (Youth)</option>
                <option value="over18">Over 18 (Adult)</option>
                <option value="organization">Organization</option>
              </select>

              <select
                value={selectedPeriodFilter}
                onChange={(e) => setSelectedPeriodFilter(e.target.value as any)}
                className="bg-input border border-border text-foreground text-xs font-mono rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="all">{t('allPeriods')}</option>
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-muted text-muted-foreground text-[10px] uppercase font-bold border-b border-border">
                  <th className="py-3 px-4">{t('colDateTime')}</th>
                  <th className="py-3 px-4">{t('colMemberName')}</th>
                  <th className="py-3 px-4">{t('colCategory')}</th>
                  <th className="py-3 px-4">{t('colExtensionPeriod')}</th>
                  <th className="py-3 px-4">{isAdmin ? t('colFeeAndMethod') : t('colPaymentStatus')}</th>
                  <th className="py-3 px-4 text-right">{t('colProcessedBy')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground font-mono">
                      {t('noAuditRecords')}
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 text-muted-foreground">
                        <span>{log.extendedAt}</span>
                        <span className="text-muted-foreground/70 text-[11px] ml-1.5">{log.timeFormatted}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">
                        {log.memberName}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            log.memberCategory === 'under18'
                              ? 'warning'
                              : log.memberCategory === 'organization'
                              ? 'info'
                              : 'success'
                          }
                        >
                          {log.memberCategory === 'under18'
                            ? 'Under 18 (Youth)'
                            : log.memberCategory === 'organization'
                            ? 'Organization'
                            : 'Over 18 (Adult)'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-primary font-bold">
                        {log.monthsAdded === 1 ? '1 Month' : `${log.monthsAdded} Months`}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {isAdmin ? (
                          <>
                            <span className="text-foreground font-bold mr-1">{formatCurrency(log.feePaid)}</span>
                            <span className="text-muted-foreground text-[11px]">({log.paymentMethod})</span>
                          </>
                        ) : (
                          <Badge variant="success">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            <span>Paid ({log.paymentMethod})</span>
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {log.staffLogged}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
