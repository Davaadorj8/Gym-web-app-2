import { describe, it, expect } from 'vitest';
import {
  calculatePlanFee,
  resolveMemberCategory,
  computeNewExpirationDate,
  calculateExtensionFee,
  filterMembers,
  PricingService,
} from '@/lib/services';
import {
  MembershipStatusService,
  RefundService,
  calculateProratedRefund,
} from '@/server/services';
import { BuiltPlan, GymMember } from '@/lib/types';
import { getMemberRepository } from '@/server/repositories';

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

describe('Pricing Rules Engine', () => {
  it('should apply promo code discounts correctly', () => {
    // 10% percentage discount on 100,000 * 3 months = 300,000 subtotal
    const result = PricingService.calculatePrice({
      basePlanPrice: 100000,
      durationMonths: 3,
      promoCode: 'SAVE10',
    });
    expect(result.subtotal).toBe(300000);
    expect(result.discountAmount).toBe(30000); // 10%
    expect(result.taxAmount).toBe(27000); // 10% of 270,000
    expect(result.totalPayable).toBe(297000); // 270,000 + 27,000
  });

  it('should apply family or group size discounts', () => {
    // 10% group discount for size 3 on 50,000 * 1 month = 50,000 subtotal
    const result = PricingService.calculatePrice({
      basePlanPrice: 50000,
      durationMonths: 1,
      groupSize: 3,
    });
    expect(result.subtotal).toBe(50000);
    expect(result.discountAmount).toBe(5000); // 10% for group >= 3
  });

  it('should apply plan upgrade proration credits', () => {
    const result = PricingService.calculatePrice({
      basePlanPrice: 150000,
      durationMonths: 1,
      prorationCredit: 40000,
    });
    expect(result.subtotal).toBe(150000);
    expect(result.prorationCredit).toBe(40000);
    expect(result.taxAmount).toBe(11000); // 10% of (150,000 - 40,000)
    expect(result.totalPayable).toBe(121000); // 110,000 + 11,000
  });
});

describe('Refund and Proration flow', () => {
  it('should calculate the correct prorated refund quotes', () => {
    const start = new Date('2026-08-01');
    const end = new Date('2026-08-31');
    const totalPaid = 300000;
    
    // Hardcode Date.now mock or let calculateProratedRefund compute relative to today.
    // Let's verify that proration correctly computes remaining and gross refund.
    const quote = calculateProratedRefund(start, end, totalPaid, 0.05);
    
    expect(quote.totalPaid).toBe(300000);
    expect(quote.dailyRate).toBeCloseTo(10000, 0);
    expect(quote.grossRefundAmount).toBeGreaterThanOrEqual(0);
    expect(quote.cancellationFee).toBe(quote.grossRefundAmount * 0.05);
  });

  it('should perform a full and prorated cancellation on a member', async () => {
    const memberRepo = getMemberRepository();
    const testMember: GymMember = {
      id: 'refund-test-member',
      firstName: 'Refundee',
      lastName: 'User',
      email: 'refundee@example.com',
      phone: '99223344',
      planTitle: 'Adult 1 Month',
      durationMonths: 1,
      startDate: '2026-08-01',
      expirationDate: '2026-09-01',
      status: 'Active',
      occupancyStatus: 'Checked Out',
    };

    await memberRepo.create(testMember);

    const result = await RefundService.cancelAndRefund('refund-test-member', 'FULL', {
      notes: 'Test refunding fully',
      staffName: 'Admin',
    });

    expect(result.success).toBe(true);
    expect(result.refundAmount).toBe(120000); // default fallback plan price
    expect(result.member.status).toBe('Refunded');
  });
});
