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
import { GymMember, CategoryTarget, AuthUser, BuiltPlan } from '@/lib/types';
import { Card, Badge, Input } from '@/components/ui';
import { useDashboard } from '@/lib/orchestration';
import {
  calculateTotalMembershipValue,
  calculateWeeklyDistribution,
  calculateRevenueByPlan,
  calculateMembersByPlanTier,
  aggregateExtensionMetrics,
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
    if (members.length === 0) return '100.0%';
    const pct = (activeMembersCount / members.length) * 100;
    return `${pct.toFixed(1)}%`;
  }, [members, activeMembersCount]);

  // Weekly Check-in Distribution via domain service
  const weeklyDistribution = useMemo(() => {
    return calculateWeeklyDistribution(members);
  }, [members]);

  // Plan Revenue distribution via domain service
  const revenueByPlan = useMemo(() => {
    return calculateRevenueByPlan(members, plans);
  }, [members, plans]);

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

  // Max value helper for bar charts
  const maxWeekly = Math.max(...weeklyDistribution.map((d) => d.count), 4);
  const maxRevenue = Math.max(...revenueByPlan.map((d) => d.revenue), 120);
  const maxPlanCount = Math.max(...membersByPlanTier.map((d) => d.count), 4);
  const maxCatCount = Math.max(
    categoryBreakdown.under18.count,
    categoryBreakdown.over18.count,
    categoryBreakdown.organization.count,
    4
  );
  const maxPeriodCount = Math.max(
    periodBreakdown.m1.count,
    periodBreakdown.m3.count,
    periodBreakdown.m6.count,
    periodBreakdown.m12.count,
    4
  );

  return (
    <div id="analytics-view-root" className="space-y-6 pb-12">
      {/* ================= TOP 3 SUMMARY METRICS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
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
                ${totalMembershipValue.toLocaleString()}
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

      {/* ================= SECTION 2: CHARTS ROW ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Weekly Check-in Distribution */}
        <Card
          id="card-weekly-checkin-distribution"
          className="p-5 shadow-md space-y-4"
        >
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {t('weeklyCheckInTitle')}
            </h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {t('weeklyCheckInSubtitle')}
            </p>
          </div>

          <div className="pt-6 pb-2">
            <div className="h-44 flex items-end justify-between gap-3 border-b border-border px-2 relative">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                <div className="border-b border-foreground w-full"></div>
                <div className="border-b border-foreground w-full"></div>
                <div className="border-b border-foreground w-full"></div>
                <div className="border-b border-foreground w-full"></div>
              </div>

              {weeklyDistribution.map((item) => {
                const heightPct = Math.min(100, Math.max(8, (item.count / maxWeekly) * 100));
                const hasValue = item.count > 0;
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 z-10">
                    <div className="w-full flex justify-center items-end h-36">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[36px] rounded-t-md transition-all duration-500 ${
                          hasValue
                            ? 'bg-primary shadow-sm shadow-primary/30'
                            : 'bg-muted'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground font-bold">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Chart 2: Revenue by Plan or Athletes by Plan Tier */}
        <Card
          id="card-revenue-by-plan"
          className="p-5 shadow-md space-y-4"
        >
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {isAdmin ? t('revenueByPlanTitle') : t('athletesByPlanTierTitle')}
            </h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {isAdmin ? t('revenueByPlanSubtitle') : t('athletesByPlanTierSubtitle')}
            </p>
          </div>

          <div className="pt-6 pb-2">
            <div className="h-44 flex items-end justify-between gap-4 border-b border-border px-4 relative">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                <div className="border-b border-foreground w-full"></div>
                <div className="border-b border-foreground w-full"></div>
                <div className="border-b border-foreground w-full"></div>
                <div className="border-b border-foreground w-full"></div>
              </div>

              {isAdmin
                ? revenueByPlan.map((item) => {
                    const heightPct = Math.min(100, Math.max(6, (item.revenue / maxRevenue) * 100));
                    const hasValue = item.revenue > 0;
                    return (
                      <div key={item.fullName} className="flex-1 flex flex-col items-center gap-2 z-10">
                        <div className="w-full flex justify-center items-end h-36">
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full max-w-[64px] rounded-t-md transition-all duration-500 ${
                              hasValue
                                ? 'bg-sky-400 shadow-sm shadow-sky-400/30'
                                : 'bg-muted'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground font-bold truncate max-w-[70px] text-center" title={item.fullName}>
                          {item.plan}
                        </span>
                      </div>
                    );
                  })
                : membersByPlanTier.map((item) => {
                    const heightPct = Math.min(100, Math.max(6, (item.count / maxPlanCount) * 100));
                    const hasValue = item.count > 0;
                    return (
                      <div key={item.fullName} className="flex-1 flex flex-col items-center gap-2 z-10">
                        <div className="w-full flex justify-center items-end h-36">
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full max-w-[64px] rounded-t-md transition-all duration-500 ${
                              hasValue
                                ? 'bg-sky-400 shadow-sm shadow-sky-400/30'
                                : 'bg-muted'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground font-bold truncate max-w-[70px] text-center" title={`${item.fullName} (${item.count} athletes)`}>
                          {item.plan}
                        </span>
                      </div>
                    );
                  })}
            </div>
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
                ${totalExtensionRevenue.toLocaleString()}
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

        {/* 2 Breakdown Charts: Extensions by Category & Period */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Subchart 1 */}
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

            <div className="h-36 flex items-end justify-between gap-4 border-b border-border px-6">
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex justify-center items-end h-28">
                  <div
                    style={{
                      height: `${Math.max(6, (categoryBreakdown.under18.count / maxCatCount) * 100)}%`,
                    }}
                    className={`w-full max-w-[48px] rounded-t-md transition-all ${
                      categoryBreakdown.under18.count > 0 ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground font-bold text-center">
                  Under 18
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex justify-center items-end h-28">
                  <div
                    style={{
                      height: `${Math.max(6, (categoryBreakdown.over18.count / maxCatCount) * 100)}%`,
                    }}
                    className={`w-full max-w-[48px] rounded-t-md transition-all ${
                      categoryBreakdown.over18.count > 0 ? 'bg-primary shadow-sm shadow-primary/20' : 'bg-muted'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground font-bold text-center">
                  Over 18
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex justify-center items-end h-28">
                  <div
                    style={{
                      height: `${Math.max(6, (categoryBreakdown.organization.count / maxCatCount) * 100)}%`,
                    }}
                    className={`w-full max-w-[48px] rounded-t-md transition-all ${
                      categoryBreakdown.organization.count > 0 ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground font-bold text-center">
                  Organization
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-muted/40 border border-border rounded-xl p-2">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">Under 18</p>
                <p className="text-base font-extrabold text-foreground font-mono mt-0.5">{categoryBreakdown.under18.count}</p>
                {isAdmin ? (
                  <p className="text-[10px] font-mono text-emerald-400 font-bold">${categoryBreakdown.under18.revenue}</p>
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
                  <p className="text-[10px] font-mono text-emerald-400 font-bold">${categoryBreakdown.over18.revenue}</p>
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
                  <p className="text-[10px] font-mono text-emerald-400 font-bold">${categoryBreakdown.organization.revenue}</p>
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

          {/* Subchart 2 */}
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

            <div className="h-36 flex items-end justify-between gap-3 border-b border-border px-4">
              {[
                { label: '1 Mo', count: periodBreakdown.m1.count },
                { label: '3 Mo', count: periodBreakdown.m3.count },
                { label: '6 Mo', count: periodBreakdown.m6.count },
                { label: '12 Mo', count: periodBreakdown.m12.count },
                { label: 'Other', count: periodBreakdown.other.count },
              ].map((p) => {
                const heightPct = Math.max(6, (p.count / maxPeriodCount) * 100);
                const hasValue = p.count > 0;
                return (
                  <div key={p.label} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex justify-center items-end h-28">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[36px] rounded-t-md transition-all ${
                          hasValue ? 'bg-sky-400 shadow-sm shadow-sky-400/20' : 'bg-muted'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground font-bold text-center">
                      {p.label}
                    </span>
                  </div>
                );
              })}
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
                            <span className="text-foreground font-bold mr-1">${log.feePaid}</span>
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
