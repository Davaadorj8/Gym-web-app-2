import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryLockerRepository, InMemoryLockerLogRepository } from '@/features/lockers';
import {
  updateLockerStatusAction,
  setTotalLockersAction,
  logLockerEventAction,
  getLockerStatusesAction,
  getTotalLockersAction,
} from '@/features/lockers';

describe('InMemoryLockerRepository Contract', () => {
  let lockerRepo: InMemoryLockerRepository;
  const dtCtx = { tenantId: 'tenant-arche', locationId: 'loc-downtown' };
  const utCtx = { tenantId: 'tenant-arche', locationId: 'loc-uptown' };

  beforeEach(() => {
    lockerRepo = new InMemoryLockerRepository();
  });

  it('creates a status record on first upsert and updates it on the next', async () => {
    const created = await lockerRepo.upsertStatus(dtCtx, 'Locker #01', 'clean', 'wiped down');
    expect(created.status).toBe('clean');
    expect(created.notes).toBe('wiped down');

    const updated = await lockerRepo.upsertStatus(dtCtx, 'Locker #01', 'available');
    expect(updated.status).toBe('available');
    // notes carries over from the previous record when not provided on this call
    expect(updated.notes).toBe('wiped down');

    const all = await lockerRepo.findAll(dtCtx);
    expect(all).toHaveLength(1);
  });

  it('enforces location-level scoping for locker statuses', async () => {
    await lockerRepo.upsertStatus(dtCtx, 'Locker #01', 'repair');
    await lockerRepo.upsertStatus(utCtx, 'Locker #02', 'key_lost');

    const dtFound = await lockerRepo.findAll(dtCtx);
    expect(dtFound.some((l) => l.lockerNumber === 'Locker #01')).toBe(true);
    expect(dtFound.some((l) => l.lockerNumber === 'Locker #02')).toBe(false);

    const utFound = await lockerRepo.findAll(utCtx);
    expect(utFound.some((l) => l.lockerNumber === 'Locker #02')).toBe(true);
    expect(utFound.some((l) => l.lockerNumber === 'Locker #01')).toBe(false);
  });

  it('defaults total capacity and tracks it per tenant+location', async () => {
    const defaultCapacity = await lockerRepo.getTotalCapacity(dtCtx);
    expect(defaultCapacity).toBe(60);

    await lockerRepo.setTotalCapacity(dtCtx, 80);
    const dtCapacity = await lockerRepo.getTotalCapacity(dtCtx);
    expect(dtCapacity).toBe(80);

    // A different location is unaffected and still reports the default
    const utCapacity = await lockerRepo.getTotalCapacity(utCtx);
    expect(utCapacity).toBe(60);
  });

  it('normalizes capacity to a minimum of 1', async () => {
    const result = await lockerRepo.setTotalCapacity(dtCtx, -5);
    expect(result).toBe(1);
  });
});

describe('InMemoryLockerLogRepository (previously orphaned, now consumed)', () => {
  it('accepts a log entry written by logLockerEventAction', async () => {
    const logRepo = new InMemoryLockerLogRepository();
    await logRepo.create(
      { tenantId: 'tenant-arche', locationId: 'loc-downtown' },
      {
        id: 'log-1',
        lockerNumber: 'Locker #01',
        memberId: 'mem-1',
        memberName: 'Test Member',
        eventType: 'Checked In',
        eventDescription: 'test',
        timestamp: new Date().toISOString(),
        timeFormatted: '12:00 PM',
        statusLabel: 'Check-In Logged',
        staffLogged: 'Admin',
      }
    );
    const logs = await logRepo.findRecentLogs({ tenantId: 'tenant-arche' });
    expect(logs).toHaveLength(1);
  });
});

describe('lockers feature actions', () => {
  const tenantId = 'tenant-arche';
  const locationId = 'loc-downtown';

  it('updateLockerStatusAction validates and persists', async () => {
    const badResult = await updateLockerStatusAction({ lockerNumber: 'Locker #01' });
    expect(badResult.success).toBe(false);

    const result = await updateLockerStatusAction({
      tenantId,
      locationId,
      lockerNumber: 'Locker #05',
      status: 'inactive',
      notes: 'out of service',
    });
    expect(result.success).toBe(true);
    expect(result.data?.status).toBe('inactive');

    const statusesResult = await getLockerStatusesAction({ tenantId, locationId });
    expect(statusesResult.success).toBe(true);
    expect(statusesResult.data?.['Locker #05']).toBe('inactive');
  });

  it('setTotalLockersAction validates and persists', async () => {
    const badResult = await setTotalLockersAction({ tenantId, locationId, count: -1 });
    expect(badResult.success).toBe(false);

    const result = await setTotalLockersAction({ tenantId, locationId, count: 75 });
    expect(result.success).toBe(true);
    expect(result.data).toBe(75);

    const totalResult = await getTotalLockersAction({ tenantId, locationId });
    expect(totalResult.success).toBe(true);
    expect(totalResult.data).toBe(75);
  });

  it('logLockerEventAction validates and persists', async () => {
    const badResult = await logLockerEventAction({ tenantId, locationId });
    expect(badResult.success).toBe(false);

    const result = await logLockerEventAction({
      tenantId,
      locationId,
      lockerNumber: 'Locker #10',
      memberId: 'mem-42',
      memberName: 'Jane Doe',
      eventType: 'Checked In',
      eventDescription: 'Check-in recorded',
      statusLabel: 'Check-In Logged',
    });
    expect(result.success).toBe(true);
    expect(result.data?.lockerNumber).toBe('Locker #10');
  });
});
