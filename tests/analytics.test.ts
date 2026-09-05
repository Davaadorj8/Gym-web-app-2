import { describe, it, expect } from 'vitest';
import {
  calculateWeeklyDistribution,
  calculateHourlyTraffic,
  calculateTotalMembershipValue,
  calculateMembersByPlanTier,
  aggregateExtensionMetrics,
} from '@/lib/services';
import { findPlanForMember } from '@/lib/services';
import { GymMember, BuiltPlan, MembershipExtensionLog } from '@/lib/types';

function makeMember(overrides: Partial<GymMember> = {}): GymMember {
  return {
    id: 'mem-1',
    firstName: 'Test',
    lastName: 'Member',
    email: 'test@example.com',
    phone: '99000000',
    planTitle: 'plan-adult',
    durationMonths: 1,
    startDate: '2026-08-01',
    expirationDate: '2026-09-01',
    status: 'Active',
    occupancyStatus: 'Checked Out',
    ...overrides,
  };
}

function makePlan(overrides: Partial<BuiltPlan> = {}): BuiltPlan {
  return {
    id: 'plan-adult',
    categoryTarget: 'over18',
    title: 'Adult Full Access Pass',
    durationMonths: 1,
    price: 150000,
    ...overrides,
  };
}

describe('findPlanForMember', () => {
  it('matches a member to its plan via planTitle (which stores the plan id)', () => {
    const plans = [makePlan({ id: 'plan-a' }), makePlan({ id: 'plan-b' })];
    const member = makeMember({ planTitle: 'plan-b' });
    expect(findPlanForMember(member, plans)?.id).toBe('plan-b');
  });

  it('returns undefined when no plan matches', () => {
    const plans = [makePlan({ id: 'plan-a' })];
    const member = makeMember({ planTitle: 'no-such-plan' });
    expect(findPlanForMember(member, plans)).toBeUndefined();
  });
});

describe('calculateWeeklyDistribution / calculateHourlyTraffic', () => {
  it('buckets check-in log timestamps by day and hour', () => {
    const logs = [
      { timestamp: '2026-08-03T09:00:00.000Z' }, // Monday
      { timestamp: '2026-08-03T14:00:00.000Z' }, // Monday
      { timestamp: '2026-08-04T09:00:00.000Z' }, // Tuesday
    ];

    const weekly = calculateWeeklyDistribution(logs);
    expect(weekly).toHaveLength(7);
    expect(weekly[0]).toEqual({ name: 'Mon', checkIns: 2 });
    expect(weekly[1]).toEqual({ name: 'Tue', checkIns: 1 });

    const hourly = calculateHourlyTraffic(logs);
    expect(hourly).toHaveLength(24);
    const nineAm = hourly.find((h) => h.time === new Date(logs[0].timestamp).getHours().toString().padStart(2, '0') + ':00');
    expect(nineAm?.count).toBeGreaterThanOrEqual(1);
  });
});

describe('calculateTotalMembershipValue', () => {
  it('only sums plan price for currently checked-in members', () => {
    const plans = [makePlan({ id: 'plan-a', price: 100000 }), makePlan({ id: 'plan-b', price: 200000 })];
    const members = [
      makeMember({ id: 'm1', planTitle: 'plan-a', occupancyStatus: 'Checked In' }),
      makeMember({ id: 'm2', planTitle: 'plan-b', occupancyStatus: 'Checked Out' }),
    ];
    expect(calculateTotalMembershipValue(members, plans)).toBe(100000);
  });
});

describe('calculateMembersByPlanTier', () => {
  it('counts members grouped by their plan categoryTarget', () => {
    const plans = [
      makePlan({ id: 'plan-adult', categoryTarget: 'over18' }),
      makePlan({ id: 'plan-youth', categoryTarget: 'under18' }),
    ];
    const members = [
      makeMember({ id: 'm1', planTitle: 'plan-adult' }),
      makeMember({ id: 'm2', planTitle: 'plan-adult' }),
      makeMember({ id: 'm3', planTitle: 'plan-youth' }),
    ];
    const result = calculateMembersByPlanTier(members, plans);
    expect(result).toContainEqual({ name: 'over18', value: 2 });
    expect(result).toContainEqual({ name: 'under18', value: 1 });
  });
});

describe('aggregateExtensionMetrics', () => {
  function makeExtension(overrides: Partial<MembershipExtensionLog> = {}): MembershipExtensionLog {
    return {
      id: 'ext-1',
      extendedAt: '2026-08-01',
      timeFormatted: '10:00 AM',
      monthsAdded: 1,
      previousExpirationDate: '2026-08-01',
      newExpirationDate: '2026-09-01',
      feePaid: 50000,
      paymentMethod: 'Cash',
      ...overrides,
    };
  }

  it('prefers the historically-stamped memberCategory over recomputing from current member state', () => {
    // The member is currently an organization, but the extension log was stamped
    // 'over18' at the time it happened (e.g. before a plan change) — the log's stored
    // category must win, not the member's present-day category.
    const member = makeMember({
      id: 'm1',
      isOrganization: true,
      extensionHistory: [makeExtension({ memberCategory: 'over18' })],
    });

    const result = aggregateExtensionMetrics([member]);
    expect(result.categoryBreakdown.over18.count).toBe(1);
    expect(result.categoryBreakdown.organization.count).toBe(0);
    expect(result.allLogs[0].memberCategory).toBe('over18');
  });

  it('falls back to resolveMemberCategory when a log has no stored memberCategory', () => {
    const member = makeMember({
      id: 'm1',
      isOrganization: true,
      extensionHistory: [makeExtension({ memberCategory: undefined })],
    });

    const result = aggregateExtensionMetrics([member]);
    expect(result.categoryBreakdown.organization.count).toBe(1);
  });

  it('aggregates revenue, transaction counts, and renewal percentage across members', () => {
    const members = [
      makeMember({
        id: 'm1',
        extensionHistory: [
          makeExtension({ id: 'e1', feePaid: 50000, monthsAdded: 1, memberCategory: 'over18' }),
          makeExtension({ id: 'e2', feePaid: 300000, monthsAdded: 12, memberCategory: 'over18' }),
        ],
      }),
      makeMember({ id: 'm2', extensionHistory: [] }),
    ];

    const result = aggregateExtensionMetrics(members);
    expect(result.totalTransactions).toBe(2);
    expect(result.uniqueMembersCount).toBe(1);
    expect(result.totalRevenue).toBe(350000);
    expect(result.renewalPercentage).toBe('50%');
    expect(result.topPeriodLabel).toBe('1 Month'); // tied count, m1 checked first
    expect(result.periodBreakdown.m1.count).toBe(1);
    expect(result.periodBreakdown.m12.count).toBe(1);
  });

  it('returns zeroed metrics for members with no extension history', () => {
    const result = aggregateExtensionMetrics([makeMember({ extensionHistory: [] })]);
    expect(result.totalTransactions).toBe(0);
    expect(result.uniqueMembersCount).toBe(0);
    expect(result.totalRevenue).toBe(0);
    expect(result.renewalPercentage).toBe('0%');
  });
});
