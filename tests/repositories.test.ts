import { describe, it, expect, beforeEach } from 'vitest';
import {
  InMemoryMemberRepository,
  InMemoryPlanRepository,
} from '@/server/repositories/in-memory';
import { GymMember, BuiltPlan } from '@/lib/types';

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

  it('should soft delete and restore a gym member', async () => {
    const member: GymMember = {
      id: 'test-mem-soft-delete',
      firstName: 'Soft',
      lastName: 'Deleted',
      email: 'soft@example.com',
      phone: '99001122',
      planTitle: 'Adult 1 Month',
      durationMonths: 1,
      startDate: '2026-08-01',
      expirationDate: '2026-09-01',
      status: 'Active',
      occupancyStatus: 'Checked Out',
    };

    await memberRepo.create(member);

    // Initial find should succeed
    let found = await memberRepo.findById('test-mem-soft-delete');
    expect(found).not.toBeNull();

    // Soft delete member
    const deleteResult = await memberRepo.delete('test-mem-soft-delete', 'usr-admin-123');
    expect(deleteResult).toBe(true);

    // After soft delete, findById and findAll should filter it out
    found = await memberRepo.findById('test-mem-soft-delete');
    expect(found).toBeNull();

    const allMembers = await memberRepo.findAll();
    expect(allMembers.some((m) => m.id === 'test-mem-soft-delete')).toBe(false);

    // Restore member
    const restoreResult = await memberRepo.restore('test-mem-soft-delete', 'usr-admin-123');
    expect(restoreResult).toBe(true);

    // After restore, should be found again and soft-delete fields cleared/null
    found = await memberRepo.findById('test-mem-soft-delete');
    expect(found).not.toBeNull();
    expect(found?.deletedAt).toBeNull();
    expect(found?.deletedBy).toBeNull();
  });

  it('should enforce multi-tenancy and location-level scoping', async () => {
    const dtCtx = { tenantId: 'tenant-arche', locationId: 'loc-downtown' };
    const utCtx = { tenantId: 'tenant-arche', locationId: 'loc-uptown' };
    const allCtx = { tenantId: 'tenant-arche', locationId: 'all' };
    const otherTenantCtx = { tenantId: 'tenant-other', locationId: 'loc-downtown' };

    await memberRepo.create(dtCtx, {
      id: 'dt-scoped-member',
      firstName: 'Downtown',
      lastName: 'User',
      email: 'dtuser@example.com',
      phone: '99001111',
      planTitle: 'Adult Pass',
      durationMonths: 1,
      startDate: '2026-08-01',
      expirationDate: '2026-09-01',
      status: 'Active',
      occupancyStatus: 'Checked Out',
    });

    await memberRepo.create(utCtx, {
      id: 'ut-scoped-member',
      firstName: 'Uptown',
      lastName: 'User',
      email: 'utuser@example.com',
      phone: '99002222',
      planTitle: 'Adult Pass',
      durationMonths: 1,
      startDate: '2026-08-01',
      expirationDate: '2026-09-01',
      status: 'Active',
      occupancyStatus: 'Checked Out',
    });

    // Downtown scoped search
    const dtFound = await memberRepo.findAll(dtCtx);
    expect(dtFound.some((m) => m.id === 'dt-scoped-member')).toBe(true);
    expect(dtFound.some((m) => m.id === 'ut-scoped-member')).toBe(false);

    // Uptown scoped search
    const utFound = await memberRepo.findAll(utCtx);
    expect(utFound.some((m) => m.id === 'ut-scoped-member')).toBe(true);
    expect(utFound.some((m) => m.id === 'dt-scoped-member')).toBe(false);

    // Organization-wide aggregated search
    const allFound = await memberRepo.findAll(allCtx);
    expect(allFound.some((m) => m.id === 'dt-scoped-member')).toBe(true);
    expect(allFound.some((m) => m.id === 'ut-scoped-member')).toBe(true);

    // Foreign tenant isolation search
    const otherFound = await memberRepo.findAll(otherTenantCtx);
    expect(otherFound.some((m) => m.id === 'dt-scoped-member')).toBe(false);
    expect(otherFound.some((m) => m.id === 'ut-scoped-member')).toBe(false);
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
