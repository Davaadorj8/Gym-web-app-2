import { describe, it, expect } from 'vitest';
import {
  calculatePlanFee,
  resolveMemberCategory,
  computeNewExpirationDate,
  calculateExtensionFee,
  filterMembers,
} from '@/lib/services';
import { BuiltPlan, GymMember } from '@/lib/types';

describe('Plan & Member Service Computations', () => {
  it('calculates plan fee based on monthly rate and multiplier', () => {
    const plan: BuiltPlan = {
      id: 'p1',
      categoryTarget: 'over18',
      title: 'Standard',
      durationMonths: 1,
      price: 100,
    };

    const fee = calculatePlanFee(plan, 3);
    expect(fee.total).toBe(300);
    expect(fee.monthlyRate).toBe(100);
  });

  it('correctly resolves member category target', () => {
    const orgMember = { isOrganization: true, planCategory: 'organization' as const };
    expect(resolveMemberCategory(orgMember)).toBe('organization');

    const under18Member = { planCategory: 'under18' as const };
    expect(resolveMemberCategory(under18Member)).toBe('under18');

    const adultMember = { planCategory: 'over18' as const };
    expect(resolveMemberCategory(adultMember)).toBe('over18');
  });

  it('computes extension dates properly', () => {
    const futureDate = '2026-12-01';
    const extended = computeNewExpirationDate(futureDate, 2);
    expect(extended).toBe('2027-02-01');
  });

  it('filters members by active status and query string', () => {
    const members: GymMember[] = [
      {
        id: 'm1',
        firstName: 'Anar',
        lastName: 'Ganzorig',
        email: 'anar@gym.mn',
        phone: '99110011',
        planTitle: 'Adult Pass',
        durationMonths: 1,
        startDate: '2026-08-01',
        expirationDate: '2026-09-01',
        status: 'Active',
        occupancyStatus: 'Checked In',
      },
      {
        id: 'm2',
        firstName: 'Bilguun',
        lastName: 'Baterdene',
        email: 'bilguun@gym.mn',
        phone: '88110022',
        planTitle: 'Adult Pass',
        durationMonths: 1,
        startDate: '2026-06-01',
        expirationDate: '2026-07-01',
        status: 'Expired',
        occupancyStatus: 'Checked Out',
      },
    ];

    const activeInGym = filterMembers(members, '', 'in-gym');
    expect(activeInGym.length).toBe(1);
    expect(activeInGym[0]?.firstName).toBe('Anar');

    const searched = filterMembers(members, 'bilguun', 'all');
    expect(searched.length).toBe(1);
    expect(searched[0]?.id).toBe('m2');
  });
});
