import { BuiltPlan, GymMember, MembershipExtensionLog } from '@/lib/types';

export type AnalyticsTab = 'financial' | 'operational' | 'plans' | 'nutrients' | 'lockers' | 'members';

export const PLAN_TIER_COLORS = ['#3b82f6', '#38bdf8', '#10b981', '#f59e0b', '#a78bfa'];

export function resolveMemberCategory(member: GymMember): 'under18' | 'over18' | 'organization' {
  if (member.isOrganization) return 'organization';
  if (member.dob) {
    const age = new Date().getFullYear() - new Date(member.dob).getFullYear();
    if (age < 18) return 'under18';
  }
  return 'over18';
}

export function getMemberFullName(member: GymMember): string {
  if (member.isOrganization && member.orgName) return member.orgName;
  return `${member.firstName} ${member.lastName}`.trim();
}

export function calculateTotalMembershipValue(members: GymMember[], plans: BuiltPlan[]): number {
  return members.reduce((acc, member) => {
    if (member.occupancyStatus !== 'Checked In') return acc;
    const plan = plans.find((p) => p.id === member.planTitle);
    return acc + (plan?.price || 0);
  }, 0);
}

export function calculateWeeklyDistribution(logs: { timestamp: string }[]) {
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

export function calculateHourlyTraffic(logs: { timestamp: string }[]) {
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

export function calculateMembersByPlanTier(members: GymMember[], plans: BuiltPlan[]) {
  const counts: Record<string, number> = {};
  members.forEach((m) => {
    const plan = plans.find((p) => p.id === m.planTitle);
    if (plan) {
      counts[plan.categoryTarget] = (counts[plan.categoryTarget] || 0) + 1;
    }
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function aggregateExtensionMetrics(members: GymMember[]) {
  const allLogs: Array<MembershipExtensionLog & { memberId: string; memberName: string; memberCategory: 'under18' | 'over18' | 'organization' }> = [];
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
      const cat = resolveMemberCategory(m);
      m.extensionHistory.forEach((ext) => {
        const log = {
          ...ext,
          memberId: m.id,
          memberName: getMemberFullName(m),
          memberCategory: cat,
        };
        allLogs.push(log);
        totalRevenue += ext.feePaid || 0;

        if (categoryBreakdown[cat]) {
          categoryBreakdown[cat].count++;
          categoryBreakdown[cat].revenue += ext.feePaid || 0;
        }

        const months = ext.monthsAdded;
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
    members.length > 0
      ? Math.round((uniqueMembersCount / members.length) * 100) + '%'
      : '0%';

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
