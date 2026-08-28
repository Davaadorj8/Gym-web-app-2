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
  Activity,
  Package,
  Lock,
  BarChart3,
  TrendingUp,
  Unlock,
  Database,
  Layers,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  AlertTriangle,
  Tag,
  Filter,
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
import { GymMember, AuthUser, BuiltPlan, getMemberFullName } from '@/lib/types';
import { Card, Badge, Input } from '@/components/ui';
import { useDashboard } from '@/lib/orchestration';
import { formatCurrency, CURRENCY_SYMBOL, cn } from '@/lib/utils';
import {
  calculateTotalMembershipValue,
  calculateWeeklyDistribution,
  calculateMembersByPlanTier,
  aggregateExtensionMetrics,
  calculateHourlyTraffic,
  calculateOccupancyMetrics,
} from '@/lib/services';

interface AnalyticsViewProps {
  members?: GymMember[];
  plans?: BuiltPlan[];
  currentUser?: AuthUser;
}

type AnalyticsTab = 'financial' | 'operational' | 'plan' | 'nutrients' | 'locker' | 'members';

const PLAN_TIER_COLORS = ['#3b82f6', '#38bdf8', '#10b981', '#f59e0b', '#a78bfa'];

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

  // State for Switch Tabs: financial, operational, plan (product), nutrients, locker, members
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('financial');

  // Internal filters for Audit Logs & Charts
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'under18' | 'over18' | 'organization'>('all');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<'all' | '1' | '3' | '6' | '12' | 'other'>('all');
  const [trafficViewMode, setTrafficViewMode] = useState<'weekly' | 'hourly'>('weekly');
  const [financialChartMode, setFinancialChartMode] = useState<'category' | 'period'>('category');

  // Nutrient Analytics Switchable Chart & Filter State
  const [nutrientChartMode, setNutrientChartMode] = useState<'category' | 'valuation' | 'status'>('category');
  const [searchNutrientQuery, setSearchNutrientQuery] = useState('');
  const [selectedNutrientCategoryFilter, setSelectedNutrientCategoryFilter] = useState<string>('all');
  const [selectedNutrientStatusFilter, setSelectedNutrientStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Domain Calculations via Services
  const totalMembershipValue = useMemo(() => {
    return calculateTotalMembershipValue(members, plans);
  }, [members, plans]);

  const totalCheckInsLogged = useMemo(() => {
    return members.reduce((acc, m) => {
      return acc + (m.lastCheckInTime ? 1 : 0) + (m.occupancyStatus === 'Checked In' ? 1 : 0);
    }, 0);
  }, [members]);

  const activeMembersCount = useMemo(() => {
    return members.filter((m) => m.status === 'Active').length;
  }, [members]);

  const retentionRate = useMemo(() => {
    if (members.length === 0) return '0%';
    const pct = Math.round((activeMembersCount / members.length) * 100);
    return `${pct}%`;
  }, [members, activeMembersCount]);

  const weeklyDistribution = useMemo(() => {
    return calculateWeeklyDistribution(members);
  }, [members]);

  const hourlyTraffic = useMemo(() => {
    return calculateHourlyTraffic(members);
  }, [members]);

  const peakTrafficHour = useMemo(() => {
    if (!hourlyTraffic || hourlyTraffic.length === 0) return 'N/A';
    const sorted = [...hourlyTraffic].sort((a, b) => b.count - a.count);
    const peak = sorted[0];
    return peak && peak.count > 0 ? `${peak.hour} (${peak.count})` : 'N/A';
  }, [hourlyTraffic]);

  const membersByPlanTier = useMemo(() => {
    return calculateMembersByPlanTier(members);
  }, [members]);

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

  // Locker Occupancy Metrics
  const activeOccupants = useMemo(() => {
    return members.filter((m) => m.occupancyStatus === 'Checked In');
  }, [members]);

  const lockerMetrics = useMemo(() => {
    const totalLockers = dashboard.totalLockers;
    return calculateOccupancyMetrics(totalLockers, activeOccupants.length, dashboard.lockerStatuses);
  }, [dashboard.totalLockers, activeOccupants.length, dashboard.lockerStatuses]);

  const lockerStatusCounts = useMemo(() => {
    const totalLockers = dashboard.totalLockers;
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
  }, [dashboard.totalLockers, dashboard.lockerStatuses]);

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

  const planTierChartData = useMemo(() => {
    return membersByPlanTier.map((item, index) => ({
      name: item.fullName,
      count: item.count,
      fill: PLAN_TIER_COLORS[index % PLAN_TIER_COLORS.length],
    }));
  }, [membersByPlanTier]);

  // Nutrient Inventory Metrics & Chart Data
  const nutrients = dashboard.nutrients;

  const nutrientMetrics = useMemo(() => {
    const totalProducts = nutrients.length;
    const totalStock = nutrients.reduce((acc, n) => acc + (n.stock || 0), 0);
    const totalValue = nutrients.reduce((acc, n) => acc + (n.price || 0) * (n.stock || 0), 0);
    const lowStockCount = nutrients.filter((n) => n.stock > 0 && n.stock <= 5).length;
    const outOfStockCount = nutrients.filter((n) => n.stock === 0).length;
    const inStockCount = nutrients.filter((n) => n.stock > 5).length;

    const categoryMap: Record<string, { count: number; stock: number; totalValue: number }> = {
      Supplements: { count: 0, stock: 0, totalValue: 0 },
      Shakes: { count: 0, stock: 0, totalValue: 0 },
      Beverages: { count: 0, stock: 0, totalValue: 0 },
      Snacks: { count: 0, stock: 0, totalValue: 0 },
      Vitamins: { count: 0, stock: 0, totalValue: 0 },
    };

    nutrients.forEach((n) => {
      const cat = n.category || 'Supplements';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { count: 0, stock: 0, totalValue: 0 };
      }
      categoryMap[cat].count += 1;
      categoryMap[cat].stock += n.stock || 0;
      categoryMap[cat].totalValue += (n.price || 0) * (n.stock || 0);
    });

    const categoryChartData = [
      { name: 'Supplements', stock: categoryMap['Supplements']?.stock || 0, totalValue: categoryMap['Supplements']?.totalValue || 0, fill: '#3b82f6' },
      { name: 'Shakes', stock: categoryMap['Shakes']?.stock || 0, totalValue: categoryMap['Shakes']?.totalValue || 0, fill: '#10b981' },
      { name: 'Beverages', stock: categoryMap['Beverages']?.stock || 0, totalValue: categoryMap['Beverages']?.totalValue || 0, fill: '#38bdf8' },
      { name: 'Snacks', stock: categoryMap['Snacks']?.stock || 0, totalValue: categoryMap['Snacks']?.totalValue || 0, fill: '#f59e0b' },
      { name: 'Vitamins', stock: categoryMap['Vitamins']?.stock || 0, totalValue: categoryMap['Vitamins']?.totalValue || 0, fill: '#a78bfa' },
    ];

    const statusChartData = [
      { name: 'In Stock (>5)', count: inStockCount, fill: '#10b981' },
      { name: 'Low Stock (1-5)', count: lowStockCount, fill: '#f59e0b' },
      { name: 'Out of Stock (0)', count: outOfStockCount, fill: '#ef4444' },
    ];

    return {
      totalProducts,
      totalStock,
      totalValue,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      categoryMap,
      categoryChartData,
      statusChartData,
    };
  }, [nutrients]);

  const filteredNutrientList = useMemo(() => {
    return nutrients.filter((n) => {
      const q = searchNutrientQuery.toLowerCase();
      const matchesSearch =
        n.name.toLowerCase().includes(q) ||
        (n.flavor && n.flavor.toLowerCase().includes(q)) ||
        n.category.toLowerCase().includes(q);

      const matchesCat =
        selectedNutrientCategoryFilter === 'all' || n.category === selectedNutrientCategoryFilter;

      let matchesStatus = true;
      if (selectedNutrientStatusFilter === 'in_stock') {
        matchesStatus = n.stock > 5;
      } else if (selectedNutrientStatusFilter === 'low_stock') {
        matchesStatus = n.stock > 0 && n.stock <= 5;
      } else if (selectedNutrientStatusFilter === 'out_of_stock') {
        matchesStatus = n.stock === 0;
      }

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [nutrients, searchNutrientQuery, selectedNutrientCategoryFilter, selectedNutrientStatusFilter]);

  const tabs: { id: AnalyticsTab; label: string; icon: React.ElementType }[] = [
    { id: 'financial', label: t.has('tabFinancial') ? t('tabFinancial') : 'Financial', icon: DollarSign },
    { id: 'operational', label: t.has('tabOperational') ? t('tabOperational') : 'Operational', icon: Activity },
    { id: 'plan', label: t.has('tabPlan') ? t('tabPlan') : 'Plan (Product)', icon: Package },
    { id: 'nutrients', label: t.has('tabNutrients') ? t('tabNutrients') : 'Nutrients', icon: Sparkles },
    { id: 'locker', label: t.has('tabLocker') ? t('tabLocker') : 'Locker', icon: Lock },
    { id: 'members', label: t.has('tabMembers') ? t('tabMembers') : 'Members', icon: Users },
  ];

  return (
    <div id="analytics-view-root" className="space-y-6 pb-16">
      {/* ================= HEADER & TAB SWITCH NAVIGATION ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              {t('analyticsHeaderTitle', { defaultValue: 'Analytics & Insights' })}
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {t('analyticsHeaderSubtitle', {
              defaultValue: 'Comprehensive performance metrics for financial, operational, product plans, locker usage, and member retention',
            })}
          </p>
        </div>

        {/* Switch Tabs Navigation */}
        <div
          id="analytics-tabs-navigation"
          className="flex items-center gap-1 bg-muted/60 border border-border p-1.5 rounded-xl overflow-x-auto self-start md:self-center"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                  isActive
                    ? 'bg-background text-primary shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-primary' : 'text-muted-foreground')} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB 1: FINANCIAL ANALYTICS ================= */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card id="metric-total-membership-value" className="p-5 relative overflow-hidden shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  {t('totalMembershipValue')}
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {formatCurrency(totalMembershipValue)}
                </h2>
                <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                  {t('activeSubscriptions', { count: activeMembersCount })}
                </p>
              </div>
            </Card>

            <Card id="metric-extension-revenue" className="p-5 relative overflow-hidden shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  {t('extensionRevenue')}
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <RefreshCw className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {formatCurrency(totalExtensionRevenue)}
                </h2>
                <p className="text-xs font-mono font-bold text-purple-400 mt-1">
                  {t('collectedFromExtensions')} ({totalExtensionTransactions} {t('eventsUnit')})
                </p>
              </div>
            </Card>

            <Card id="metric-nutrient-financial-stock" className="p-5 relative overflow-hidden shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Nutrient Inventory Value
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {formatCurrency(nutrientMetrics.totalValue)}
                </h2>
                <p className="text-xs font-mono font-bold text-amber-400 mt-1">
                  {nutrientMetrics.totalStock} units across {nutrientMetrics.totalProducts} products
                </p>
              </div>
            </Card>

            <Card id="metric-renewal-rate" className="p-5 relative overflow-hidden shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  {t('renewalRate')}
                </span>
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {renewalPercentage}
                </h2>
                <p className="text-xs font-mono font-bold text-sky-400 mt-1">
                  {t('athletesWithRenewals')} ({uniqueExtendedMemberCount} {t('athletesUnit')})
                </p>
              </div>
            </Card>
          </div>

          {/* Revenue Charts Row - Merged single switch graph table */}
          <Card className="p-5 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  {financialChartMode === 'category' ? t('extensionsByCategory') : t('extensionsByPeriod')}
                </h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {financialChartMode === 'category'
                    ? 'Under 18 • Over 18 • Organization'
                    : '1 Mo • 3 Mo • 6 Mo • 12 Mo • Other'}
                </p>
              </div>

              {/* Switch graph buttons */}
              <div className="flex items-center gap-1.5 bg-muted/60 border border-border p-1 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  id="btn-switch-chart-category"
                  onClick={() => setFinancialChartMode('category')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer',
                    financialChartMode === 'category'
                      ? 'bg-background text-primary shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('extensionsByCategory')}
                </button>
                <button
                  type="button"
                  id="btn-switch-chart-period"
                  onClick={() => setFinancialChartMode('period')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer',
                    financialChartMode === 'period'
                      ? 'bg-background text-primary shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('extensionsByPeriod')}
                </button>
              </div>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {financialChartMode === 'category' ? (
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }} />
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
                      formatter={(val: any) => [formatCurrency(val as number), 'Revenue']}
                    />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cat-cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <BarChart data={periodChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }} />
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
                      formatter={(val: any) => [`${val} Extensions`, 'Count']}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {periodChartData.map((entry, index) => (
                        <Cell key={`period-cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Audit Records Table */}
          <Card className="p-5 space-y-4 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">{t('auditRecordsLogTitle')}</h3>
                <Badge variant="primary">{t('recordsBadge', { count: filteredAuditLogs.length })}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="text"
                  placeholder={t('searchMemberPlaceholder')}
                  value={searchMemberQuery}
                  onChange={(e) => setSearchMemberQuery(e.target.value)}
                  icon={<Search className="w-3.5 h-3.5 text-muted-foreground" />}
                />
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value as any)}
                  className="bg-input border border-border text-foreground text-xs font-mono rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="all">{t('allCategories')}</option>
                  <option value="under18">Under 18</option>
                  <option value="over18">Over 18</option>
                  <option value="organization">Organization</option>
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
                        <td className="py-3 px-4 font-bold text-foreground">{log.memberName}</td>
                        <td className="py-3 px-4">
                          <Badge variant={log.memberCategory === 'under18' ? 'warning' : log.memberCategory === 'organization' ? 'info' : 'success'}>
                            {log.memberCategory === 'under18' ? 'Under 18' : log.memberCategory === 'organization' ? 'Organization' : 'Over 18'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-primary font-bold">{log.monthsAdded} Months</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          <span className="text-foreground font-bold mr-1">{formatCurrency(log.feePaid)}</span>
                          <span className="text-muted-foreground text-[11px]">({log.paymentMethod})</span>
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">{log.staffLogged}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ================= TAB 2: OPERATIONAL ANALYTICS ================= */}
      {activeTab === 'operational' && (
        <div className="space-y-6">
          {/* Operational KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                  {t('totalCheckInsLogged')}
                </span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mt-2">{totalCheckInsLogged}</h3>
              <p className="text-[11px] font-mono text-sky-400 mt-0.5">{t('realFrontDeskActivity')}</p>
            </Card>

            <Card className="p-4 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                  Peak Hour
                </span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-xl font-extrabold text-foreground mt-2">{peakTrafficHour}</h3>
              <p className="text-[11px] font-mono text-amber-400 mt-0.5">Highest floor occupancy</p>
            </Card>

            <Card className="p-4 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                  Retention Rate
                </span>
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mt-2">{retentionRate}</h3>
              <p className="text-[11px] font-mono text-emerald-400 mt-0.5">Active member percentage</p>
            </Card>

            <Card className="p-4 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                  Current Occupants
                </span>
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mt-2">{activeOccupants.length}</h3>
              <p className="text-[11px] font-mono text-primary mt-0.5">Athletes currently in gym</p>
            </Card>
          </div>

          {/* Traffic Analysis Integrated Card */}
          <Card id="card-traffic-analysis" className="p-5 shadow-md space-y-4">
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
                    'px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer',
                    trafficViewMode === 'weekly' ? 'bg-background text-primary shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('weeklyTab', { defaultValue: 'Weekly' })}
                </button>
                <button
                  type="button"
                  onClick={() => setTrafficViewMode('hourly')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer',
                    trafficViewMode === 'hourly' ? 'bg-background text-primary shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('hourlyTab', { defaultValue: 'Hourly' })}
                </button>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              {trafficViewMode === 'weekly' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }} />
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
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="hour" tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: 'monospace' }} interval={3} />
                    <YAxis tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: 'monospace' }} allowDecimals={false} />
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
                    <Area type="monotone" dataKey="count" stroke="var(--primary)" fillOpacity={1} fill="url(#colorTraffic)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ================= TAB 3: PLAN (PRODUCT) ANALYTICS ================= */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          {/* Plan KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 shadow-sm">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Total Built Plans</span>
              <h3 className="text-2xl font-extrabold text-foreground mt-2">{plans.length}</h3>
              <p className="text-[11px] font-mono text-primary mt-0.5">Active catalog options</p>
            </Card>

            <Card className="p-4 shadow-sm">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Top Duration</span>
              <h3 className="text-2xl font-extrabold text-foreground mt-2">{topExtensionPeriod}</h3>
              <p className="text-[11px] font-mono text-amber-400 mt-0.5">{t('mostSelectedDuration')}</p>
            </Card>

            <Card className="p-4 shadow-sm">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Renewal Rate</span>
              <h3 className="text-2xl font-extrabold text-foreground mt-2">{renewalPercentage}</h3>
              <p className="text-[11px] font-mono text-sky-400 mt-0.5">Recurring members</p>
            </Card>

            <Card className="p-4 shadow-sm">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Active Subscriptions</span>
              <h3 className="text-2xl font-extrabold text-foreground mt-2">{activeMembersCount}</h3>
              <p className="text-[11px] font-mono text-emerald-400 mt-0.5">Enrolled athletes</p>
            </Card>
          </div>

          {/* Plan Tier Distribution Chart */}
          <Card className="p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">{t('athletesByPlanTierTitle')}</h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{t('athletesByPlanTierSubtitle')}</p>
              </div>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={planTierChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }} />
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
                    formatter={(val: any) => [`${val} Athletes`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {planTierChartData.map((entry, index) => (
                      <Cell key={`tier-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Configured Plans Overview Table */}
          <Card className="p-5 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Catalog Products & Pricing</h3>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-muted text-muted-foreground text-[10px] uppercase font-bold border-b border-border">
                    <th className="py-3 px-4">PLAN NAME</th>
                    <th className="py-3 px-4">CATEGORY TIER</th>
                    <th className="py-3 px-4">DURATION</th>
                    <th className="py-3 px-4">PRICE (₮ MNT)</th>
                    <th className="py-3 px-4 text-right">ENROLLED ATHLETES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {plans.map((p) => {
                    const enrolled = members.filter((m) => m.planCategory === p.categoryTarget).length;
                    return (
                      <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground">{p.title}</td>
                        <td className="py-3 px-4">
                          <Badge variant={p.categoryTarget === 'under18' ? 'warning' : p.categoryTarget === 'organization' ? 'info' : 'success'}>
                            {p.categoryTarget}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{p.durationMonths} Months</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">{formatCurrency(p.price)}</td>
                        <td className="py-3 px-4 text-right font-bold text-primary">{enrolled}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ================= TAB 4: NUTRIENT INVENTORY ANALYTICS ================= */}
      {activeTab === 'nutrients' && (
        <div className="space-y-6">
          {/* Nutrient KPI Strip */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card id="metric-nutrient-products" className="p-4 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                  Active Products
                </span>
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mt-2">{nutrientMetrics.totalProducts}</h3>
              <p className="text-[11px] font-mono text-primary mt-0.5">Items in catalog</p>
            </Card>

            <Card id="metric-nutrient-stock" className="p-4 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                  Total Inventory Stock
                </span>
                <Package className="w-4 h-4 text-sky-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mt-2">{nutrientMetrics.totalStock} units</h3>
              <p className="text-[11px] font-mono text-sky-400 mt-0.5">Available across categories</p>
            </Card>

            <Card id="metric-nutrient-valuation" className="p-4 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                  Inventory Asset Value
                </span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mt-2">{formatCurrency(nutrientMetrics.totalValue)}</h3>
              <p className="text-[11px] font-mono text-emerald-400 mt-0.5">Potential retail revenue</p>
            </Card>

            <Card id="metric-nutrient-health" className="p-4 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                  Stock Health Alert
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mt-2">
                {nutrientMetrics.lowStockCount + nutrientMetrics.outOfStockCount}
              </h3>
              <p className="text-[11px] font-mono text-amber-400 mt-0.5">
                {nutrientMetrics.lowStockCount} Low Stock • {nutrientMetrics.outOfStockCount} Out
              </p>
            </Card>
          </div>

          {/* Single Switchable Graph Card */}
          <Card id="card-nutrient-switchable-graph" className="p-5 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  {nutrientChartMode === 'category'
                    ? 'Nutrient Stock Units by Category'
                    : nutrientChartMode === 'valuation'
                    ? 'Inventory Value by Category (₮ MNT)'
                    : 'Stock Health Distribution'}
                </h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {nutrientChartMode === 'category'
                    ? 'Supplements • Shakes • Beverages • Snacks • Vitamins'
                    : nutrientChartMode === 'valuation'
                    ? 'Total inventory asset valuation per product category'
                    : 'In Stock (>5 units) • Low Stock (1-5 units) • Out of Stock (0 units)'}
                </p>
              </div>

              {/* View Switch Toggles */}
              <div className="flex items-center gap-1.5 bg-muted/60 border border-border p-1 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  id="btn-switch-nutrient-category"
                  onClick={() => setNutrientChartMode('category')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer',
                    nutrientChartMode === 'category'
                      ? 'bg-background text-primary shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Stock Volume
                </button>
                <button
                  type="button"
                  id="btn-switch-nutrient-valuation"
                  onClick={() => setNutrientChartMode('valuation')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer',
                    nutrientChartMode === 'valuation'
                      ? 'bg-background text-primary shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Asset Valuation
                </button>
                <button
                  type="button"
                  id="btn-switch-nutrient-status"
                  onClick={() => setNutrientChartMode('status')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer',
                    nutrientChartMode === 'status'
                      ? 'bg-background text-primary shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Stock Status
                </button>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {nutrientChartMode === 'status' ? (
                  <BarChart data={nutrientMetrics.statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }} />
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
                      formatter={(val: any) => [`${val} Products`, 'Count']}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {nutrientMetrics.statusChartData.map((entry, idx) => (
                        <Cell key={`cell-status-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <BarChart data={nutrientMetrics.categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }} />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={{ stroke: 'var(--border)' }}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }}
                      tickFormatter={(val) => (nutrientChartMode === 'valuation' ? `${(val / 1000000).toFixed(1)}M` : val)}
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
                      formatter={(val: any) => [
                        nutrientChartMode === 'valuation' ? formatCurrency(val) : `${val} Units`,
                        nutrientChartMode === 'valuation' ? 'Total Value' : 'Stock Units',
                      ]}
                    />
                    <Bar
                      dataKey={nutrientChartMode === 'valuation' ? 'totalValue' : 'stock'}
                      radius={[6, 6, 0, 0]}
                    >
                      {nutrientMetrics.categoryChartData.map((entry, idx) => (
                        <Cell key={`cell-cat-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Nutrient Stock Breakdown & Filterable Table */}
          <Card className="p-5 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Nutrient Inventory Breakdown</h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="text"
                  placeholder="Search nutrient product or flavor..."
                  value={searchNutrientQuery}
                  onChange={(e) => setSearchNutrientQuery(e.target.value)}
                  icon={<Search className="w-3.5 h-3.5 text-muted-foreground" />}
                />

                <select
                  value={selectedNutrientCategoryFilter}
                  onChange={(e) => setSelectedNutrientCategoryFilter(e.target.value)}
                  className="bg-input border border-border text-foreground text-xs font-mono rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="Supplements">Supplements</option>
                  <option value="Shakes">Shakes</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Vitamins">Vitamins</option>
                </select>

                <select
                  value={selectedNutrientStatusFilter}
                  onChange={(e) => setSelectedNutrientStatusFilter(e.target.value as any)}
                  className="bg-input border border-border text-foreground text-xs font-mono rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="all">All Stock Statuses</option>
                  <option value="in_stock">In Stock (&gt;5)</option>
                  <option value="low_stock">Low Stock (1-5)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-muted text-muted-foreground text-[10px] uppercase font-bold border-b border-border">
                    <th className="py-3 px-4">PRODUCT NAME</th>
                    <th className="py-3 px-4">CATEGORY</th>
                    <th className="py-3 px-4">FLAVOR / VARIANT</th>
                    <th className="py-3 px-4">UNIT PRICE</th>
                    <th className="py-3 px-4">CURRENT STOCK</th>
                    <th className="py-3 px-4">TOTAL ASSET VALUE</th>
                    <th className="py-3 px-4 text-right">STOCK STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredNutrientList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground font-mono">
                        No nutrient items found in inventory matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredNutrientList.map((item) => {
                      const itemValuation = (item.price || 0) * (item.stock || 0);
                      const isLow = item.stock > 0 && item.stock <= 5;
                      const isOut = item.stock === 0;

                      return (
                        <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-foreground">{item.name}</td>
                          <td className="py-3 px-4">
                            <Badge variant="info">{item.category}</Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{item.flavor || '—'}</td>
                          <td className="py-3 px-4 font-bold text-emerald-400">{formatCurrency(item.price)}</td>
                          <td className="py-3 px-4 font-bold text-foreground">{item.stock} units</td>
                          <td className="py-3 px-4 font-bold text-primary">{formatCurrency(itemValuation)}</td>
                          <td className="py-3 px-4 text-right">
                            {isOut ? (
                              <Badge variant="destructive">Out of Stock</Badge>
                            ) : isLow ? (
                              <Badge variant="warning">Low Stock ({item.stock})</Badge>
                            ) : (
                              <Badge variant="success">In Stock</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ================= TAB 5: LOCKER ANALYTICS ================= */}
      {activeTab === 'locker' && (
        <div className="space-y-6">
          {/* Locker Status Consolidated Card */}
          <Card id="locker-status-overview" className="p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                    <Database className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">
                      {t('lockerStatusOverview', { defaultValue: 'Locker Status Overview' })}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      {t('lockerStatusBreakdown', {
                        total: lockerMetrics.totalLockers,
                        free: lockerMetrics.availableCount,
                        occupied: lockerMetrics.occupiedCount,
                        out: lockerMetrics.outOfServiceCount,
                        defaultValue: `${lockerMetrics.totalLockers} Total = ${lockerMetrics.availableCount} Free / ${lockerMetrics.occupiedCount} Occupied / ${lockerMetrics.outOfServiceCount} Out`,
                      })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div id="stat-total" className="space-y-1">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{t('totalCapacity')}</span>
                    <p className="text-2xl font-black text-foreground font-mono">{lockerMetrics.totalLockers}</p>
                  </div>
                  <div id="stat-free" className="space-y-1">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{t('lockersAvailable')}</span>
                    <p className="text-2xl font-black text-emerald-400 font-mono">{lockerMetrics.availableCount}</p>
                  </div>
                  <div id="stat-occupied" className="space-y-1">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{t('currentlyOccupied')}</span>
                    <p className="text-2xl font-black text-sky-400 font-mono">{lockerMetrics.occupiedCount}</p>
                  </div>
                  <div id="stat-out" className="space-y-1">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{t('underService', { defaultValue: 'UNDER SERVICE' })}</span>
                    <p className="text-2xl font-black text-amber-500 font-mono">{lockerMetrics.outOfServiceCount}</p>
                  </div>
                </div>

                {/* Detailed Maintenance & Operational Status Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50 text-[10px] font-mono">
                  <span className="text-muted-foreground uppercase font-bold text-[9px]">Breakdown:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Needs Clean: <strong className="ml-1 font-extrabold">{lockerStatusCounts.clean}</strong>
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Repair Fix: <strong className="ml-1 font-extrabold">{lockerStatusCounts.repair}</strong>
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                    Key Lost: <strong className="ml-1 font-extrabold">{lockerStatusCounts.key_lost}</strong>
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Key Overdue: <strong className="ml-1 font-extrabold">{lockerStatusCounts.key_not_returned}</strong>
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">
                    Inactive: <strong className="ml-1 font-extrabold">{lockerStatusCounts.inactive}</strong>
                  </span>
                </div>
              </div>

              <div className="w-px h-24 bg-border hidden md:block mx-4" />

              <div className="space-y-4 min-w-[200px]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">{t('utilizationRate')}</span>
                  <span className="text-sm font-black text-sky-400 font-mono">{lockerMetrics.occupancyRate}%</span>
                </div>
                <div className="w-full bg-muted h-3 rounded-full overflow-hidden border border-border">
                  <div
                    className="bg-sky-400 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${lockerMetrics.occupancyRate}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground font-mono text-right">
                  Based on active key issuance
                </p>
              </div>
            </div>
          </Card>

          {/* Currently Active Locker Occupants Table */}
          <Card className="p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-foreground">Active Locker Occupants on Floor</h3>
              </div>
              <Badge variant="primary">{activeOccupants.length} Key Holders</Badge>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-muted text-muted-foreground text-[10px] uppercase font-bold border-b border-border">
                    <th className="py-3 px-4">LOCKER #</th>
                    <th className="py-3 px-4">ATHLETE NAME</th>
                    <th className="py-3 px-4">MEMBER ID</th>
                    <th className="py-3 px-4">CHECK-IN TIME</th>
                    <th className="py-3 px-4 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeOccupants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground font-mono">
                        No active key holders currently on floor
                      </td>
                    </tr>
                  ) : (
                    activeOccupants.map((m) => (
                      <tr key={m.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-4 font-extrabold text-sky-400">#{m.assignedLocker || 'N/A'}</td>
                        <td className="py-3 px-4 font-bold text-foreground">{getMemberFullName(m)}</td>
                        <td className="py-3 px-4 text-muted-foreground">{m.id}</td>
                        <td className="py-3 px-4 text-muted-foreground">{m.lastCheckInTime || 'Just now'}</td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant="success">Checked In</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ================= TAB 5: MEMBERS ANALYTICS ================= */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Members KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 shadow-sm">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">{t('activeGymRoster')}</span>
              <h3 className="text-2xl font-extrabold text-foreground mt-2">{members.length}</h3>
              <p className="text-[11px] font-mono text-primary mt-0.5">Total registered members</p>
            </Card>

            <Card className="p-4 shadow-sm">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Active Roster</span>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-2">{activeMembersCount}</h3>
              <p className="text-[11px] font-mono text-emerald-400 mt-0.5">{t('activeEnrolledMembers')}</p>
            </Card>

            <Card className="p-4 shadow-sm">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">{t('memberRetentionRate')}</span>
              <h3 className="text-2xl font-extrabold text-foreground mt-2">{retentionRate}</h3>
              <p className="text-[11px] font-mono text-sky-400 mt-0.5">{t('retentionSubtitle', { active: activeMembersCount, total: members.length })}</p>
            </Card>

            <Card className="p-4 shadow-sm">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Unique Renewals</span>
              <h3 className="text-2xl font-extrabold text-purple-400 mt-2">{uniqueExtendedMemberCount}</h3>
              <p className="text-[11px] font-mono text-purple-400 mt-0.5">{t('uniqueAthleteRenewals')}</p>
            </Card>
          </div>

          {/* Member Demographics Chart */}
          <Card className="p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Demographic Category Distribution</h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">Breakdown by Youth, Adult, and Organization members</p>
              </div>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }} />
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
                    formatter={(val: any) => [`${val} Members`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`demo-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Member Search & Extension History */}
          <Card className="p-5 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">{t('auditRecordsLogTitle')}</h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="text"
                  placeholder={t('searchMemberPlaceholder')}
                  value={searchMemberQuery}
                  onChange={(e) => setSearchMemberQuery(e.target.value)}
                  icon={<Search className="w-3.5 h-3.5 text-muted-foreground" />}
                />
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value as any)}
                  className="bg-input border border-border text-foreground text-xs font-mono rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="all">{t('allCategories')}</option>
                  <option value="under18">Under 18</option>
                  <option value="over18">Over 18</option>
                  <option value="organization">Organization</option>
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
                    <th className="py-3 px-4 text-right">{t('colProcessedBy')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground font-mono">
                        {t('noAuditRecords')}
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-4 text-muted-foreground">{log.extendedAt} {log.timeFormatted}</td>
                        <td className="py-3 px-4 font-bold text-foreground">{log.memberName}</td>
                        <td className="py-3 px-4">
                          <Badge variant={log.memberCategory === 'under18' ? 'warning' : log.memberCategory === 'organization' ? 'info' : 'success'}>
                            {log.memberCategory === 'under18' ? 'Under 18' : log.memberCategory === 'organization' ? 'Organization' : 'Over 18'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-primary font-bold">{log.monthsAdded} Months</td>
                        <td className="py-3 px-4 text-right text-muted-foreground">{log.staffLogged}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
