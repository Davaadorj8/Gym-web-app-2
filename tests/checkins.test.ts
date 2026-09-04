import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryMemberRepository } from '@/server/repositories/in-memory';
import { GymMember } from '@/lib/types';
import { checkInMemberAction, checkOutMemberAction } from '@/features/checkins';
import { getMemberRepository } from '@/server/repositories';

function makeMember(id: string): GymMember {
  return {
    id,
    firstName: 'Test',
    lastName: 'Member',
    email: `${id}@example.com`,
    phone: '99000000',
    planTitle: 'Adult Pass',
    durationMonths: 1,
    startDate: '2026-08-01',
    expirationDate: '2026-09-01',
    status: 'Active',
    occupancyStatus: 'Checked Out',
  };
}

describe('IMemberRepository.updateCheckInStatus contract', () => {
  let memberRepo: InMemoryMemberRepository;
  const dtCtx = { tenantId: 'tenant-arche', locationId: 'loc-downtown' };
  const utCtx = { tenantId: 'tenant-arche', locationId: 'loc-uptown' };

  beforeEach(() => {
    memberRepo = new InMemoryMemberRepository();
  });

  it('checks a member in: sets status, locker, and lastCheckInTime', async () => {
    await memberRepo.create(dtCtx, makeMember('ci-mem-1'));

    const updated = await memberRepo.updateCheckInStatus(dtCtx, 'ci-mem-1', 'Checked In', 'Locker #05');
    expect(updated?.occupancyStatus).toBe('Checked In');
    expect(updated?.assignedLocker).toBe('Locker #05');
    expect(updated?.lastCheckInTime).toBeTruthy();
  });

  it('checks a member out: clears status and locker', async () => {
    await memberRepo.create(dtCtx, makeMember('ci-mem-2'));
    await memberRepo.updateCheckInStatus(dtCtx, 'ci-mem-2', 'Checked In', 'Locker #06');

    const updated = await memberRepo.updateCheckInStatus(dtCtx, 'ci-mem-2', 'Checked Out', null);
    expect(updated?.occupancyStatus).toBe('Checked Out');
    expect(updated?.assignedLocker).toBeNull();
  });

  it('enforces tenant/location scoping — cannot check in a member from another location', async () => {
    await memberRepo.create(dtCtx, makeMember('ci-mem-3'));

    const result = await memberRepo.updateCheckInStatus(utCtx, 'ci-mem-3', 'Checked In', 'Locker #07');
    expect(result).toBeNull();
  });

  it('returns null for a non-existent member', async () => {
    const result = await memberRepo.updateCheckInStatus(dtCtx, 'no-such-member', 'Checked In', 'Locker #01');
    expect(result).toBeNull();
  });
});

describe('checkins feature actions', () => {
  const tenantId = 'tenant-arche';
  const locationId = 'loc-downtown';

  it('checkInMemberAction validates, persists, and fails for an unknown member', async () => {
    const badResult = await checkInMemberAction({ memberId: 'x' });
    expect(badResult.success).toBe(false);

    await getMemberRepository().create({ tenantId, locationId }, makeMember('action-mem-1'));

    const result = await checkInMemberAction({
      tenantId,
      locationId,
      memberId: 'action-mem-1',
      lockerNumber: 'Locker #12',
    });
    expect(result.success).toBe(true);
    expect(result.data?.occupancyStatus).toBe('Checked In');
    expect(result.data?.assignedLocker).toBe('Locker #12');

    const missingResult = await checkInMemberAction({
      tenantId,
      locationId,
      memberId: 'does-not-exist',
      lockerNumber: 'Locker #13',
    });
    expect(missingResult.success).toBe(false);
  });

  it('checkOutMemberAction validates and persists', async () => {
    const badResult = await checkOutMemberAction({ memberId: 'x' });
    expect(badResult.success).toBe(false);

    await getMemberRepository().create({ tenantId, locationId }, makeMember('action-mem-2'));
    await checkInMemberAction({ tenantId, locationId, memberId: 'action-mem-2', lockerNumber: 'Locker #14' });

    const result = await checkOutMemberAction({ tenantId, locationId, memberId: 'action-mem-2' });
    expect(result.success).toBe(true);
    expect(result.data?.occupancyStatus).toBe('Checked Out');
    expect(result.data?.assignedLocker).toBeNull();
  });
});
