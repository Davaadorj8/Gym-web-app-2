import { InMemoryRepository } from '@/server/repositories/in-memory/base';
import { CrudRepository, TenantQueryContext } from '@/server/repositories/types';
import { StaffAccount, StaffAttendance, MOCK_STAFF_ACCOUNTS } from './types';

export interface IStaffRepository extends CrudRepository<StaffAccount, string> {
  findByUsername(ctxOrUsername: TenantQueryContext | string, username?: string): Promise<StaffAccount | null>;
  findActiveStaff(ctx?: TenantQueryContext): Promise<StaffAccount[]>;
}

export type IStaffAttendanceRepository = CrudRepository<StaffAttendance, string>;

export class InMemoryStaffRepository
  extends InMemoryRepository<StaffAccount>
  implements IStaffRepository
{
  constructor() {
    super(MOCK_STAFF_ACCOUNTS);
  }

  async findByUsername(ctxOrUsername: TenantQueryContext | string, username?: string): Promise<StaffAccount | null> {
    const ctx = typeof ctxOrUsername === 'object' ? ctxOrUsername : undefined;
    const targetUsername = typeof ctxOrUsername === 'string' ? ctxOrUsername : username!;
    const normalized = targetUsername.trim().toLowerCase();
    for (const staff of this.items.values()) {
      if (staff.deletedAt) continue;
      if (!this.matchesTenant(staff, ctx)) continue;
      if (staff.username.toLowerCase() === normalized) {
        return { ...staff };
      }
    }
    return null;
  }

  async findActiveStaff(ctx?: TenantQueryContext): Promise<StaffAccount[]> {
    return Array.from(this.items.values()).filter(
      (s) => s.status === 'Active' && !s.deletedAt && this.matchesTenant(s, ctx)
    );
  }
}

export class InMemoryStaffAttendanceRepository
  extends InMemoryRepository<StaffAttendance>
  implements IStaffAttendanceRepository
{
  constructor() {
    super([]);
  }
}

const staffRepository = new InMemoryStaffRepository();
const staffAttendanceRepository = new InMemoryStaffAttendanceRepository();

export const getStaffRepository = () => staffRepository;
export const getStaffAttendanceRepository = () => staffAttendanceRepository;
