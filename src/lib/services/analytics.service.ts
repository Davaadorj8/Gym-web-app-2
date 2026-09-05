import { GymMember, BuiltPlan, CategoryTarget } from '@/lib/types';
import { resolveMemberCategory, findPlanForMember } from './plan.service';

export interface WeeklyDistributionItem {
  name: string;
  checkIns: number;
}

export interface HourlyTrafficItem {
  time: string;
  count: number;
}

export interface MembersByPlanTierItem {
  name: string;
  value: number;
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
    m1: { count: number; pct: number };
    m3: { count: number; pct: number };
    m6: { count: number; pct: number };
    m12: { count: number; pct: number };
    other: { count: number; pct: number };
  };
}

/**
 * Computes weekly check-in distribution (Mon-Sun) from raw check-in event logs — the
 * distribution reflects every historical check-in, not just each member's latest one.
 */
export function calculateWeeklyDistribution(logs: { timestamp: string }[]): WeeklyDistributionItem[] {
  const dist = Array(7).fill(0);
  logs.forEach((log) => {
    const day = new Date(log.timestamp).getDay();
    dist[day === 0 ? 6 : day - 1]++;
  });
  return [
    { name: 'Mon', checkIns: dist[0] },
    { name: 'Tue', checkIns: dist[1] },
    { name: 'Wed', checkIns: dist[2] },
    { name: 'Thu', checkIns: dist[3] },
    { name: 'Fri', checkIns: dist[4] },
    { name: 'Sat', checkIns: dist[5] },
    { name: 'Sun', checkIns: dist[6] },
  ];
}

/**
 * Computes hourly check-in traffic distribution from raw check-in event logs.
 */
export function calculateHourlyTraffic(logs: { timestamp: string }[]): HourlyTrafficItem[] {
  const dist = Array(24).fill(0);
  logs.forEach((log) => {
    const hour = new Date(log.timestamp).getHours();
    dist[hour]++;
  });
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    count: dist[i],
  }));
}

/**
 * Sums the plan price of every currently checked-in member — a real-time valuation of
 * members physically on premises right now, distinct from total subscription revenue.
 */
export function calculateTotalMembershipValue(members: GymMember[], plans: BuiltPlan[]): number {
  return members.reduce((acc, member) => {
    if (member.occupancyStatus !== 'Checked In') return acc;
    const plan = findPlanForMember(member, plans);
    return acc + (plan?.price || 0);
  }, 0);
}

/**
 * Counts members per plan target-segment, for the Plans & Products tier-distribution chart.
 */
export function calculateMembersByPlanTier(members: GymMember[], plans: BuiltPlan[]): MembersByPlanTierItem[] {
  const counts: Record<string, number> = {};
  members.forEach((m) => {
    const plan = findPlanForMember(m, plans);
    if (plan) {
      counts[plan.categoryTarget] = (counts[plan.categoryTarget] || 0) + 1;
    }
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

/**
 * Aggregates every member's extension history into renewal metrics. Each log entry's
 * `memberCategory` is read from the historical record written at extension time
 * (DashboardContext.extendMember stamps it via the canonical `resolveMemberCategory`) rather
 * than recomputed from the member's current state — a member's category can change between
 * two extensions, so re-deriving it fresh would misattribute older transactions.
 */
export function aggregateExtensionMetrics(members: GymMember[]): ExtensionMetricsSummary {
  const allLogs: ExtensionLogEntry[] = [];
  const categoryBreakdown = {
    under18: { count: 0, revenue: 0 },
    over18: { count: 0, revenue: 0 },
    organization: { count: 0, revenue: 0 },
  };
  const periodBreakdown = {
    m1: { count: 0, pct: 0 },
    m3: { count: 0, pct: 0 },
    m6: { count: 0, pct: 0 },
    m12: { count: 0, pct: 0 },
    other: { count: 0, pct: 0 },
  };
  let totalRevenue = 0;
  const extendedMembers = new Set<string>();

  members.forEach((m) => {
    if (m.extensionHistory && m.extensionHistory.length > 0) {
      extendedMembers.add(m.id);
      m.extensionHistory.forEach((ext) => {
        const cat = ext.memberCategory || resolveMemberCategory(m);
        const log: ExtensionLogEntry = {
          id: ext.id,
          extendedAt: ext.extendedAt,
          timeFormatted: ext.timeFormatted,
          memberId: m.id,
          memberName: ext.memberName || `${m.firstName} ${m.lastName}`.trim(),
          memberCategory: cat,
          monthsAdded: ext.monthsAdded,
          feePaid: ext.feePaid || 0,
          paymentMethod: ext.paymentMethod || 'Cash',
          previousExpirationDate: ext.previousExpirationDate,
          newExpirationDate: ext.newExpirationDate,
          staffLogged: ext.staffLogged || 'Staff',
        };
        allLogs.push(log);
        totalRevenue += log.feePaid;

        categoryBreakdown[cat].count++;
        categoryBreakdown[cat].revenue += log.feePaid;

        const months = log.monthsAdded;
        if (months === 1) periodBreakdown.m1.count++;
        else if (months === 3) periodBreakdown.m3.count++;
        else if (months === 6) periodBreakdown.m6.count++;
        else if (months === 12) periodBreakdown.m12.count++;
        else periodBreakdown.other.count++;
      });
    }
  });

  const totalTransactions = allLogs.length;
  const uniqueMembersCount = extendedMembers.size;
  const renewalPercentage =
    members.length > 0 ? Math.round((uniqueMembersCount / members.length) * 100) + '%' : '0%';

  if (totalTransactions > 0) {
    periodBreakdown.m1.pct = Math.round((periodBreakdown.m1.count / totalTransactions) * 100);
    periodBreakdown.m3.pct = Math.round((periodBreakdown.m3.count / totalTransactions) * 100);
    periodBreakdown.m6.pct = Math.round((periodBreakdown.m6.count / totalTransactions) * 100);
    periodBreakdown.m12.pct = Math.round((periodBreakdown.m12.count / totalTransactions) * 100);
    periodBreakdown.other.pct = Math.round((periodBreakdown.other.count / totalTransactions) * 100);
  }

  let topPeriodLabel = '1 Month';
  let maxCount = periodBreakdown.m1.count;
  if (periodBreakdown.m3.count > maxCount) {
    maxCount = periodBreakdown.m3.count;
    topPeriodLabel = '3 Months';
  }
  if (periodBreakdown.m6.count > maxCount) {
    maxCount = periodBreakdown.m6.count;
    topPeriodLabel = '6 Months';
  }
  if (periodBreakdown.m12.count > maxCount) {
    maxCount = periodBreakdown.m12.count;
    topPeriodLabel = '12 Months';
  }

  return {
    allLogs,
    uniqueMembersCount,
    renewalPercentage,
    totalRevenue,
    categoryBreakdown,
    periodBreakdown,
    totalTransactions,
    topPeriodLabel,
  };
}
