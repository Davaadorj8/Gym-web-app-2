import {
  GymMember,
  BuiltPlan,
  LockerLog,
  StaffAccount,
  MembershipExtensionLog,
  MembershipTransaction,
} from '@/lib/types';

export interface TenantQueryContext {
  tenantId: string;
  locationId?: string;
}

export interface CrudRepository<T, ID = string> {
  findAll(ctx?: TenantQueryContext): Promise<T[]>;
  findById(ctxOrId: TenantQueryContext | ID, id?: ID): Promise<T | null>;
  create(ctxOrItem: TenantQueryContext | T, item?: T): Promise<T>;
  update(ctxOrId: TenantQueryContext | ID, idOrUpdates: ID | Partial<T>, updates?: Partial<T>): Promise<T | null>;
  delete(ctxOrId: TenantQueryContext | ID, idOrActor?: ID, actorId?: string): Promise<boolean>;
  restore(ctxOrId: TenantQueryContext | ID, idOrActor?: ID, actorId?: string): Promise<boolean>;
}

export interface IMemberRepository extends CrudRepository<GymMember, string> {
  findByPhoneOrEmail(ctxOrQuery: TenantQueryContext | string, query?: string): Promise<GymMember | null>;
  findActiveMembers(ctx?: TenantQueryContext): Promise<GymMember[]>;
  findMembersInGym(ctx?: TenantQueryContext): Promise<GymMember[]>;
  addExtension(
    ctxOrMemberId: TenantQueryContext | string,
    memberIdOrExtension: string | MembershipExtensionLog,
    extension?: MembershipExtensionLog
  ): Promise<GymMember | null>;
  updateCheckInStatus(
    ctxOrMemberId: TenantQueryContext | string,
    memberIdOrStatus: string | 'Checked In' | 'Checked Out',
    occupancyStatusOrLocker?: 'Checked In' | 'Checked Out' | string | null,
    assignedLocker?: string | null
  ): Promise<GymMember | null>;
}

export interface IPlanRepository extends CrudRepository<BuiltPlan, string> {
  findByCategory(ctxOrCategory: TenantQueryContext | string, category?: string): Promise<BuiltPlan[]>;
}

export interface ILockerLogRepository extends CrudRepository<LockerLog, string> {
  findRecentLogs(ctxOrLimit?: TenantQueryContext | number, limit?: number): Promise<LockerLog[]>;
  findLogsByMember(ctxOrMemberId: TenantQueryContext | string, memberId?: string): Promise<LockerLog[]>;
}

export interface IStaffRepository extends CrudRepository<StaffAccount, string> {
  findByUsername(ctxOrUsername: TenantQueryContext | string, username?: string): Promise<StaffAccount | null>;
  findActiveStaff(ctx?: TenantQueryContext): Promise<StaffAccount[]>;
}

export interface IMembershipTransactionRepository extends CrudRepository<MembershipTransaction, string> {
  findByMemberId(ctxOrMemberId: TenantQueryContext | string, memberId?: string): Promise<MembershipTransaction[]>;
}
