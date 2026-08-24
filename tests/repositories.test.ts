import { describe, it, expect, beforeEach } from 'vitest';
import {
  InMemoryMemberRepository,
  InMemoryPlanRepository,
  InMemoryLockerLogRepository,
  InMemoryStaffRepository,
} from '@/lib/repositories/in-memory';
import { GymMember, BuiltPlan, StaffAccount, LockerLog } from '@/lib/types';

describe('InMemoryMemberRepository Contract', () => {
  let memberRepo: InMemoryMemberRepository;

  beforeEach(() => {
    memberRepo = new InMemoryMemberRepository();
  });

  it('should create and retrieve a gym member', async () => {
    const member: GymMember = {
      id: 'test-mem-1',
      firstName: 'Bat',
      lastName: 'Erdene',
      email: 'bat@example.com',
      phone: '99112233',
      planTitle: 'Adult 1 Month',
      durationMonths: 1,
      startDate: '2026-08-01',
      expirationDate: '2026-09-01',
      status: 'Active',
      occupancyStatus: 'Checked Out',
    };

    await memberRepo.create(member);
    const found = await memberRepo.findById('test-mem-1');
    expect(found).not.toBeNull();
    expect(found?.firstName).toBe('Bat');
    expect(found?.email).toBe('bat@example.com');
  });

  it('should find member by phone or email query', async () => {
    const member: GymMember = {
      id: 'test-mem-2',
      firstName: 'Saruul',
      lastName: 'Tsolmon',
      email: 'saruul@example.com',
      phone: '88001122',
      planTitle: 'Youth Pass',
      durationMonths: 1,
      startDate: '2026-08-01',
      expirationDate: '2026-09-01',
      status: 'Active',
      occupancyStatus: 'Checked Out',
    };

    await memberRepo.create(member);

    const byPhone = await memberRepo.findByPhoneOrEmail('88001122');
    expect(byPhone?.id).toBe('test-mem-2');

    const byEmail = await memberRepo.findByPhoneOrEmail('SARUUL@example.com');
    expect(byEmail?.id).toBe('test-mem-2');
  });

  it('should update check-in status and locker assignment', async () => {
    const member: GymMember = {
      id: 'test-mem-3',
      firstName: 'Temuulen',
      lastName: 'Bold',
      email: 'temuulen@example.com',
      phone: '99009900',
      planTitle: 'Adult Pass',
      durationMonths: 1,
      startDate: '2026-08-01',
      expirationDate: '2026-09-01',
      status: 'Active',
      occupancyStatus: 'Checked Out',
    };

    await memberRepo.create(member);
    await memberRepo.updateCheckInStatus('test-mem-3', 'Checked In', 'Locker #12');

    const updated = await memberRepo.findById('test-mem-3');
    expect(updated?.occupancyStatus).toBe('Checked In');
    expect(updated?.assignedLocker).toBe('Locker #12');
  });
});

describe('InMemoryPlanRepository Contract', () => {
  let planRepo: InMemoryPlanRepository;

  beforeEach(() => {
    planRepo = new InMemoryPlanRepository();
  });

  it('should create and filter plans by category target', async () => {
    const plan: BuiltPlan = {
      id: 'custom-plan-1',
      categoryTarget: 'under18',
      title: 'Junior Boxing',
      durationMonths: 3,
      price: 180,
    };

    await planRepo.create(plan);
    const under18Plans = await planRepo.findByCategory('under18');
    expect(under18Plans.some((p) => p.id === 'custom-plan-1')).toBe(true);
  });
});
