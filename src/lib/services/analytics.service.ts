import { getDay, parseISO, isValid } from 'date-fns';
import { GymMember, BuiltPlan, CategoryTarget, MembershipExtensionLog } from '@/lib/types';
import { resolveMemberCategory } from './plan.service';
import { PRICING_CONFIG } from '@/lib/constants/pricing';

export interface WeeklyDistributionItem {
  day: string;
  count: number;
}

export interface RevenueByPlanItem {
  plan: string;
  fullName: string;
  revenue: number;
}

export interface MembersByPlanItem {
  plan: string;
  fullName: string;
  count: number;
}

export interface ExtensionLogEntry {
  id: string;
  extendedAt: string;
  timeFormatted: string;
  memberId: string;
  memberName: string;
  memberCategory: CategoryTarget;
  monthsAdded: number;
  feePaid: number;
  paymentMethod: string;
  previousExpirationDate: string;
  newExpirationDate: string;
  staffLogged: string;
}

export interface ExtensionMetricsSummary {
  allLogs: ExtensionLogEntry[];
  totalTransactions: number;
  uniqueMembersCount: number;
  renewalPercentage: string;
  totalRevenue: number;
  topPeriodLabel: string;
  categoryBreakdown: {
    under18: { count: number; revenue: number };
    over18: { count: number; revenue: number };
    organization: { count: number; revenue: number };
  };
  periodBreakdown: {
    m1: { count: number; revenue: number; pct: string };
    m3: { count: number; revenue: number; pct: string };
    m6: { count: number; revenue: number; pct: string };
    m12: { count: number; revenue: number; pct: string };
    other: { count: number; revenue: number; pct: string };
  };
}

export interface HourlyTrafficItem {
  hour: string;
  count: number;
}

/**
 * Computes hourly member traffic distribution based on check-in times.
 */
export function calculateHourlyTraffic(members: GymMember[]): HourlyTrafficItem[] {
  const hourlyCounts = new Array(24).fill(0);

  members.forEach((m) => {
    // Generate some mock distribution if real data is sparse
    // In a real app, we'd use m.lastCheckInTime and maybe a history of check-ins
    if (m.lastCheckInTime) {
      try {
        const parsed = parseISO(m.lastCheckInTime);
        if (isValid(parsed)) {
          const hour = parsed.getHours();
          hourlyCounts[hour] += 1;
        }
      } catch {
        // Ignore parsing errors
      }
    }
  });

  return hourlyCounts.map((count, hour) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    count,
  }));
}

/**
 * Computes total portfolio value based on actual member plan associations.
 */
export function calculateTotalMembershipValue(members: GymMember[], plans: BuiltPlan[]): number {
  const planMap = new Map<string, BuiltPlan>();
  plans.forEach((p) => planMap.set(p.title.toLowerCase(), p));

  return members.reduce((acc, m) => {
    const months = m.durationMonths || 1;
    const matchedPlan = planMap.get(m.planTitle.toLowerCase());
    const monthlyRate = matchedPlan ? matchedPlan.price / (matchedPlan.durationMonths || 1) : PRICING_CONFIG.DEFAULT_MONTHLY_RATE;
    return acc + Math.round(monthlyRate * months);
  }, 0);
}

/**
 * Computes weekly distribution using date-fns getDay index (0=Sun, 1=Mon..6=Sat).
 */
export function calculateWeeklyDistribution(members: GymMember[]): WeeklyDistributionItem[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const counts = [0, 0, 0, 0, 0, 0, 0];

  members.forEach((m) => {
    if (m.lastCheckInTime) {
      try {
        const parsed = parseISO(m.lastCheckInTime);
        if (isValid(parsed)) {
          const jsDay = getDay(parsed); // 0 is Sunday, 1 is Monday...
          const dayIndex = (jsDay + 6) % 7; // Convert to Mon=0..Sun=6
          counts[dayIndex] += 1;
        }
      } catch {
        // Ignore invalid dates
      }
    }
  });

  return days.map((day, idx) => ({
    day,
    count: counts[idx],
  }));
}

/**
 * Computes categorized revenue breakdown cleanly across domain categories.
 */
export function calculateRevenueByPlan(members: GymMember[], plans: BuiltPlan[]): RevenueByPlanItem[] {
  const planMap = new Map<string, BuiltPlan>();
  plans.forEach((p) => planMap.set(p.title.toLowerCase(), p));

  const data: Record<string, number> = {
    'Under 18 Youth': 0,
    '12 Month Membership': 0,
    'Monthly Standard': 0,
    'Group / Org': 0,
  };

  members.forEach((m) => {
    const category = resolveMemberCategory(m);
    const months = m.durationMonths || 1;
    const matchedPlan = planMap.get(m.planTitle.toLowerCase());
    const baseRate = matchedPlan ? matchedPlan.price / (matchedPlan.durationMonths || 1) : PRICING_CONFIG.DEFAULT_MONTHLY_RATE;
    const revenue = Math.round(baseRate * months);

    if (category === 'under18') {
      data['Under 18 Youth'] += revenue;
    } else if (months >= 12) {
      data['12 Month Membership'] += revenue;
    } else if (category === 'organization') {
      data['Group / Org'] += revenue;
    } else {
      data['Monthly Standard'] += revenue;
    }
  });

  return Object.entries(data).map(([plan, revenue]) => ({
    plan: plan.length > 14 ? plan.substring(0, 12) + '...' : plan,
    fullName: plan,
    revenue,
  }));
}

/**
 * Computes operational member counts by tier.
 */
export function calculateMembersByPlanTier(members: GymMember[]): MembersByPlanItem[] {
  const data: Record<string, number> = {
    'Under 18 Youth': 0,
    '12 Month Pass': 0,
    'Monthly Standard': 0,
    'Group / Org': 0,
  };

  members.forEach((m) => {
    const category = resolveMemberCategory(m);
    const months = m.durationMonths || 1;

    if (category === 'under18') {
      data['Under 18 Youth'] += 1;
    } else if (months >= 12) {
      data['12 Month Pass'] += 1;
    } else if (category === 'organization') {
      data['Group / Org'] += 1;
    } else {
      data['Monthly Standard'] += 1;
    }
  });

  return Object.entries(data).map(([plan, count]) => ({
    plan: plan.length > 14 ? plan.substring(0, 12) + '...' : plan,
    fullName: plan,
    count,
  }));
}

/**
 * Aggregates all extension logs and derives renewal metrics.
 */
export function aggregateExtensionMetrics(members: GymMember[]): ExtensionMetricsSummary {
  const allLogs: ExtensionLogEntry[] = [];

  members.forEach((m) => {
    if (m.extensionHistory && m.extensionHistory.length > 0) {
      m.extensionHistory.forEach((log) => {
        allLogs.push({
          id: log.id,
          extendedAt: log.extendedAt,
          timeFormatted: log.timeFormatted || '12:00 PM',
          memberId: m.id,
          memberName: log.memberName || `${m.firstName} ${m.lastName}`,
          memberCategory: log.memberCategory || resolveMemberCategory(m),
          monthsAdded: log.monthsAdded || 1,
          feePaid: log.feePaid || (log.monthsAdded || 1) * PRICING_CONFIG.DEFAULT_MONTHLY_RATE,
          paymentMethod: log.paymentMethod || 'Cash',
          previousExpirationDate: log.previousExpirationDate || 'N/A',
          newExpirationDate: log.newExpirationDate || m.expirationDate,
          staffLogged: log.staffLogged || 'Staff',
        });
      });
    }
  });

  allLogs.sort((a, b) => b.id.localeCompare(a.id));

  const uniqueMembers = new Set(allLogs.map((l) => l.memberId));
  const uniqueMembersCount = uniqueMembers.size;
  const renewalPercentage =
    members.length === 0 ? '0.0%' : `${((uniqueMembersCount / members.length) * 100).toFixed(1)}%`;

  const totalRevenue = allLogs.reduce((acc, l) => acc + (l.feePaid || 0), 0);
  const totalTransactions = allLogs.length;

  // Top period calculation
  const periodCounts: Record<number, number> = {};
  allLogs.forEach((l) => {
    periodCounts[l.monthsAdded] = (periodCounts[l.monthsAdded] || 0) + 1;
  });

  let topMo = 1;
  let maxCount = 0;
  Object.entries(periodCounts).forEach(([mo, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topMo = Number(mo);
    }
  });
  const topPeriodLabel = topMo === 1 ? '1 Month' : `${topMo} Months`;

  // Category breakdown
  const categoryBreakdown = {
    under18: { count: 0, revenue: 0 },
    over18: { count: 0, revenue: 0 },
    organization: { count: 0, revenue: 0 },
  };

  allLogs.forEach((l) => {
    if (l.memberCategory === 'under18') {
      categoryBreakdown.under18.count += 1;
      categoryBreakdown.under18.revenue += l.feePaid;
    } else if (l.memberCategory === 'organization') {
      categoryBreakdown.organization.count += 1;
      categoryBreakdown.organization.revenue += l.feePaid;
    } else {
      categoryBreakdown.over18.count += 1;
      categoryBreakdown.over18.revenue += l.feePaid;
    }
  });

  // Period breakdown
  const calcPct = (cnt: number) =>
    totalTransactions === 0 ? '0%' : `${Math.round((cnt / totalTransactions) * 100)}%`;

  let m1Count = 0, m1Rev = 0;
  let m3Count = 0, m3Rev = 0;
  let m6Count = 0, m6Rev = 0;
  let m12Count = 0, m12Rev = 0;
  let otherCount = 0, otherRev = 0;

  allLogs.forEach((l) => {
    if (l.monthsAdded === 1) {
      m1Count += 1;
      m1Rev += l.feePaid;
    } else if (l.monthsAdded === 3) {
      m3Count += 1;
      m3Rev += l.feePaid;
    } else if (l.monthsAdded === 6) {
      m6Count += 1;
      m6Rev += l.feePaid;
    } else if (l.monthsAdded === 12) {
      m12Count += 1;
      m12Rev += l.feePaid;
    } else {
      otherCount += 1;
      otherRev += l.feePaid;
    }
  });

  const periodBreakdown = {
    m1: { count: m1Count, revenue: m1Rev, pct: calcPct(m1Count) },
    m3: { count: m3Count, revenue: m3Rev, pct: calcPct(m3Count) },
    m6: { count: m6Count, revenue: m6Rev, pct: calcPct(m6Count) },
    m12: { count: m12Count, revenue: m12Rev, pct: calcPct(m12Count) },
    other: { count: otherCount, revenue: otherRev, pct: calcPct(otherCount) },
  };

  return {
    allLogs,
    totalTransactions,
    uniqueMembersCount,
    renewalPercentage,
    totalRevenue,
    topPeriodLabel,
    categoryBreakdown,
    periodBreakdown,
  };
}
