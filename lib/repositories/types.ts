import {
  GymMember,
  BuiltPlan,
  LockerLog,
  StaffAccount,
  MembershipExtensionLog,
} from '@/lib/types';

export interface CrudRepository<T, ID = string> {
  findAll(): Promise<T[]>;
  findById(id: ID): Promise<T | null>;
  create(item: T): Promise<T>;
  update(id: ID, item: Partial<T>): Promise<T | null>;
  delete(id: ID, actorId?: string): Promise<boolean>;
  restore(id: ID, actorId?: string): Promise<boolean>;
}

export interface IMemberRepository extends CrudRepository<GymMember, string> {
  findByPhoneOrEmail(query: string): Promise<GymMember | null>;
  findActiveMembers(): Promise<GymMember[]>;
  findMembersInGym(): Promise<GymMember[]>;
  addExtension(memberId: string, extension: MembershipExtensionLog): Promise<GymMember | null>;
  updateCheckInStatus(
    memberId: string,
    occupancyStatus: 'Checked In' | 'Checked Out',
    assignedLocker?: string | null
  ): Promise<GymMember | null>;
}

export interface IPlanRepository extends CrudRepository<BuiltPlan, string> {
  findByCategory(category: string): Promise<BuiltPlan[]>;
}

export interface ILockerLogRepository extends CrudRepository<LockerLog, string> {
  findRecentLogs(limit?: number): Promise<LockerLog[]>;
  findLogsByMember(memberId: string): Promise<LockerLog[]>;
}

export interface IStaffRepository extends CrudRepository<StaffAccount, string> {
  findByUsername(username: string): Promise<StaffAccount | null>;
  findActiveStaff(): Promise<StaffAccount[]>;
}
