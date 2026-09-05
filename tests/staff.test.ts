import { describe, it, expect } from 'vitest';
import {
  registerStaffAction,
  updateStaffAction,
  deleteStaffAction,
  resetStaffPasswordAction,
  getStaffAction,
  clockInAction,
  clockOutAction,
  getAttendancesAction,
} from '@/features/staff';
import { verifyPassword } from '@/server/security/password';

describe('staff feature actions — accounts', () => {
  const tenantId = 'tenant-arche';
  const locationId = 'loc-downtown';

  it('registerStaffAction rejects a bad payload', async () => {
    const result = await registerStaffAction({ username: 'ab' });
    expect(result.success).toBe(false);
  });

  it('registerStaffAction hashes the password server-side and never stores it in plaintext as the hash', async () => {
    const result = await registerStaffAction({
      tenantId,
      locationId,
      username: 'test_frontdesk',
      password: 'hunter2',
      fullName: 'Test Frontdesk',
      role: 'Front Desk Staff',
      status: 'Active',
      registeredBy: 'Admin',
    });
    expect(result.success).toBe(true);
    expect(result.data?.passwordHash).toBeTruthy();
    expect(result.data?.passwordHash).not.toBe('hunter2');
    expect(await verifyPassword('hunter2', result.data!.passwordHash)).toBe(true);
    expect(await verifyPassword('wrong-password', result.data!.passwordHash)).toBe(false);

    const listResult = await getStaffAction({ tenantId, locationId });
    expect(listResult.success).toBe(true);
    expect(listResult.data?.some((s) => s.username === 'test_frontdesk')).toBe(true);
  });

  it('registerStaffAction rejects a duplicate username', async () => {
    await registerStaffAction({
      tenantId,
      locationId,
      username: 'dup_username',
      password: 'password1',
      fullName: 'First Registrant',
      role: 'Gym Trainer',
      status: 'Active',
      registeredBy: 'Admin',
    });

    const result = await registerStaffAction({
      tenantId,
      locationId,
      username: 'dup_username',
      password: 'password2',
      fullName: 'Second Registrant',
      role: 'Gym Trainer',
      status: 'Active',
      registeredBy: 'Admin',
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already registered/i);
  });

  it('updateStaffAction updates fields and fails for an unknown id', async () => {
    const created = await registerStaffAction({
      tenantId,
      locationId,
      username: 'update_target',
      password: 'password1',
      fullName: 'Original Name',
      role: 'Gym Trainer',
      status: 'Pending',
      registeredBy: 'Admin',
    });
    const id = created.data!.id;

    const updated = await updateStaffAction({
      tenantId,
      locationId,
      id,
      fullName: 'Updated Name',
      role: 'Shift Lead',
      status: 'Active',
    });
    expect(updated.success).toBe(true);
    expect(updated.data?.fullName).toBe('Updated Name');
    expect(updated.data?.status).toBe('Active');

    const missing = await updateStaffAction({
      tenantId,
      locationId,
      id: 'no-such-staff',
      fullName: 'X',
      role: 'Gym Trainer',
      status: 'Active',
    });
    expect(missing.success).toBe(false);
  });

  it('resetStaffPasswordAction replaces the password hash', async () => {
    const created = await registerStaffAction({
      tenantId,
      locationId,
      username: 'reset_target',
      password: 'old-password',
      fullName: 'Reset Target',
      role: 'Front Desk Staff',
      status: 'Active',
      registeredBy: 'Admin',
    });
    const id = created.data!.id;

    const result = await resetStaffPasswordAction({
      tenantId,
      locationId,
      id,
      newPassword: 'new-password',
    });
    expect(result.success).toBe(true);
    expect(await verifyPassword('new-password', result.data!.passwordHash)).toBe(true);
    expect(await verifyPassword('old-password', result.data!.passwordHash)).toBe(false);
  });

  it('deleteStaffAction removes the account and fails for an unknown id', async () => {
    const created = await registerStaffAction({
      tenantId,
      locationId,
      username: 'delete_target',
      password: 'password1',
      fullName: 'Delete Target',
      role: 'Gym Trainer',
      status: 'Active',
      registeredBy: 'Admin',
    });
    const id = created.data!.id;

    const deleted = await deleteStaffAction({ tenantId, locationId, id });
    expect(deleted.success).toBe(true);

    const listResult = await getStaffAction({ tenantId, locationId });
    expect(listResult.data?.some((s) => s.id === id)).toBe(false);

    const missing = await deleteStaffAction({ tenantId, locationId, id: 'no-such-staff' });
    expect(missing.success).toBe(false);
  });

  it('getStaffAction scopes results to tenant/location', async () => {
    await registerStaffAction({
      tenantId,
      locationId,
      username: 'scoped_downtown',
      password: 'password1',
      fullName: 'Downtown Only',
      role: 'Gym Trainer',
      status: 'Active',
      registeredBy: 'Admin',
    });

    const uptownResult = await getStaffAction({ tenantId, locationId: 'loc-uptown' });
    expect(uptownResult.data?.some((s) => s.username === 'scoped_downtown')).toBe(false);

    const downtownResult = await getStaffAction({ tenantId, locationId });
    expect(downtownResult.data?.some((s) => s.username === 'scoped_downtown')).toBe(true);
  });
});

describe('staff feature actions — attendance', () => {
  const tenantId = 'tenant-arche';
  const locationId = 'loc-downtown';

  it('clockInAction rejects a bad payload', async () => {
    const result = await clockInAction({ staffId: 'staff-1' });
    expect(result.success).toBe(false);
  });

  it('clockInAction creates an ON_DUTY record, clockOutAction completes it', async () => {
    const clockedIn = await clockInAction({
      tenantId,
      locationId,
      staffId: 'staff-1',
      staffName: 'Bat-Erdene',
      shiftId: 'shift-morning',
    });
    expect(clockedIn.success).toBe(true);
    expect(clockedIn.data?.status).toBe('ON_DUTY');
    expect(clockedIn.data?.clockOutTime).toBeUndefined();
    const attendanceId = clockedIn.data!.id;

    const clockedOut = await clockOutAction({ tenantId, locationId, attendanceId });
    expect(clockedOut.success).toBe(true);
    expect(clockedOut.data?.status).toBe('COMPLETED');
    expect(clockedOut.data?.clockOutTime).toBeTruthy();

    const listResult = await getAttendancesAction({ tenantId, locationId });
    expect(listResult.data?.find((a) => a.id === attendanceId)?.status).toBe('COMPLETED');
  });

  it('clockOutAction fails for an unknown attendance id', async () => {
    const result = await clockOutAction({ tenantId, locationId, attendanceId: 'no-such-attendance' });
    expect(result.success).toBe(false);
  });

  it('getAttendancesAction scopes results to tenant/location', async () => {
    const created = await clockInAction({
      tenantId,
      locationId,
      staffId: 'staff-2',
      staffName: 'Khulan',
      shiftId: 'shift-evening',
    });
    const attendanceId = created.data!.id;

    const uptownResult = await getAttendancesAction({ tenantId, locationId: 'loc-uptown' });
    expect(uptownResult.data?.some((a) => a.id === attendanceId)).toBe(false);

    const downtownResult = await getAttendancesAction({ tenantId, locationId });
    expect(downtownResult.data?.some((a) => a.id === attendanceId)).toBe(true);
  });
});
