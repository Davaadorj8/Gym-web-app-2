import {
  CrudRepository,
  IMemberRepository,
  IPlanRepository,
  ILockerLogRepository,
  ILockerRepository,
  IStaffRepository,
  IMembershipTransactionRepository,
  TenantQueryContext,
} from '../types';
import {
  GymMember,
  BuiltPlan,
  LockerLog,
  LockerStatusDetail,
  LockerCustomStatus,
  DEFAULT_LOCKER_CAPACITY,
  StaffAccount,
  MembershipExtensionLog,
  MembershipTransaction,
  MOCK_GYM_MEMBERS,
  MOCK_BUILT_PLANS,
  MOCK_LOCKER_LOGS,
  MOCK_STAFF_ACCOUNTS,
} from '@/lib/types';

export class InMemoryRepository<T extends { id: string }> implements CrudRepository<T, string> {
  protected items: Map<string, T> = new Map();

  constructor(initialItems: T[] = []) {
    initialItems.forEach((item) => this.items.set(item.id, { ...item }));
  }

  protected matchesTenant(item: { tenantId?: string; locationId?: string }, ctx?: TenantQueryContext): boolean {
    if (!ctx) return true;
    if (ctx.tenantId && item.tenantId && item.tenantId !== ctx.tenantId) {
      return false;
    }
    if (ctx.locationId && ctx.locationId !== 'all' && item.locationId && item.locationId !== ctx.locationId) {
      return false;
    }
    return true;
  }

  async findAll(ctx?: TenantQueryContext): Promise<T[]> {
    return Array.from(this.items.values()).filter((item) => {
      const anyItem = item as Record<string, unknown>;
      if (anyItem.deletedAt !== undefined && anyItem.deletedAt !== null) return false;
      return this.matchesTenant(anyItem, ctx);
    });
  }

  async findById(ctxOrId: TenantQueryContext | string, id?: string): Promise<T | null> {
    const ctx = typeof ctxOrId === 'object' ? ctxOrId : undefined;
    const targetId = typeof ctxOrId === 'string' ? ctxOrId : id!;
    const item = this.items.get(targetId);
    if (!item) return null;
    const anyItem = item as Record<string, unknown>;
    if (anyItem.deletedAt !== undefined && anyItem.deletedAt !== null) {
      return null;
    }
    if (!this.matchesTenant(anyItem, ctx)) return null;
    return { ...item };
  }

  async create(ctxOrItem: TenantQueryContext | T, item?: T): Promise<T> {
    const isCtx = typeof ctxOrItem === 'object' && ('tenantId' in ctxOrItem || 'locationId' in ctxOrItem) && !('id' in ctxOrItem);
    const ctx = isCtx ? (ctxOrItem as TenantQueryContext) : undefined;
    const newItem = isCtx ? item! : (ctxOrItem as T);
    const rec = newItem as Record<string, unknown>;
    const stamped = {
      tenantId: ctx?.tenantId || (rec.tenantId as string) || 'tenant-arche',
      locationId: (ctx?.locationId && ctx.locationId !== 'all') ? ctx.locationId : ((rec.locationId as string) || 'loc-downtown'),
      ...(newItem as object),
    } as unknown as T;
    this.items.set((stamped as Record<string, unknown>).id as string, { ...stamped });
    return { ...stamped };
  }

  async update(ctxOrId: TenantQueryContext | string, idOrUpdates: string | Partial<T>, updates?: Partial<T>): Promise<T | null> {
    const ctx = typeof ctxOrId === 'object' ? ctxOrId : undefined;
    const targetId = typeof ctxOrId === 'string' ? ctxOrId : (idOrUpdates as string);
    const actualUpdates = typeof ctxOrId === 'string' ? (idOrUpdates as Partial<T>) : updates!;
    const existing = this.items.get(targetId);
    if (!existing) return null;
    const anyExisting = existing as Record<string, unknown>;
    if (anyExisting.deletedAt !== undefined && anyExisting.deletedAt !== null) {
      return null;
    }
    if (!this.matchesTenant(anyExisting, ctx)) return null;
    const updated = { ...existing, ...actualUpdates };
    this.items.set(targetId, updated);
    return { ...updated };
  }

  async delete(ctxOrId: TenantQueryContext | string, idOrActor?: string, actorId?: string): Promise<boolean> {
    const ctx = typeof ctxOrId === 'object' ? ctxOrId : undefined;
    const targetId = typeof ctxOrId === 'string' ? ctxOrId : idOrActor!;
    const actor = typeof ctxOrId === 'string' ? idOrActor : actorId;
    const existing = this.items.get(targetId);
    if (!existing) return false;
    
    const anyExisting = existing as Record<string, unknown>;
    if (!this.matchesTenant(anyExisting, ctx)) return false;
    anyExisting.deletedAt = new Date().toISOString();
    if (actor) {
      anyExisting.deletedBy = actor;
    }
    this.items.set(targetId, { ...existing });
    return true;
  }

  async restore(ctxOrId: TenantQueryContext | string, idOrActor?: string, actorId?: string): Promise<boolean> {
    const ctx = typeof ctxOrId === 'object' ? ctxOrId : undefined;
    const targetId = typeof ctxOrId === 'string' ? ctxOrId : idOrActor!;
    const actor = typeof ctxOrId === 'string' ? idOrActor : actorId;
    const existing = this.items.get(targetId);
    if (!existing) return false;
    
    const anyExisting = existing as Record<string, unknown>;
    if (!this.matchesTenant(anyExisting, ctx)) return false;
    anyExisting.deletedAt = null;
    anyExisting.deletedBy = null;
    this.items.set(targetId, { ...existing });
    return true;
  }
}

export class InMemoryMemberRepository
  extends InMemoryRepository<GymMember>
  implements IMemberRepository
{
  constructor() {
    super(MOCK_GYM_MEMBERS);
  }

  async findByPhoneOrEmail(ctxOrQuery: TenantQueryContext | string, query?: string): Promise<GymMember | null> {
    const ctx = typeof ctxOrQuery === 'object' ? ctxOrQuery : undefined;
    const actualQuery = typeof ctxOrQuery === 'string' ? ctxOrQuery : query!;
    const normalized = actualQuery.trim().toLowerCase();
    for (const member of this.items.values()) {
      if (member.deletedAt) continue;
      if (!this.matchesTenant(member, ctx)) continue;
      if (
        (member.phone && member.phone.toLowerCase() === normalized) ||
        (member.email && member.email.toLowerCase() === normalized)
      ) {
        return { ...member };
      }
    }
    return null;
  }

  async findActiveMembers(ctx?: TenantQueryContext): Promise<GymMember[]> {
    return Array.from(this.items.values()).filter(
      (m) => m.status === 'Active' && !m.deletedAt && this.matchesTenant(m, ctx)
    );
  }

  async findMembersInGym(ctx?: TenantQueryContext): Promise<GymMember[]> {
    return Array.from(this.items.values()).filter(
      (m) => m.occupancyStatus === 'Checked In' && !m.deletedAt && this.matchesTenant(m, ctx)
    );
  }

  async addExtension(
    ctxOrMemberId: TenantQueryContext | string,
    memberIdOrExtension: string | MembershipExtensionLog,
    extension?: MembershipExtensionLog
  ): Promise<GymMember | null> {
    const ctx = typeof ctxOrMemberId === 'object' ? ctxOrMemberId : undefined;
    const memberId = typeof ctxOrMemberId === 'string' ? ctxOrMemberId : (memberIdOrExtension as string);
    const ext = typeof ctxOrMemberId === 'string' ? (memberIdOrExtension as MembershipExtensionLog) : extension!;
    const member = this.items.get(memberId);
    if (!member || member.deletedAt || !this.matchesTenant(member, ctx)) return null;
    const history = member.extensionHistory ? [...member.extensionHistory] : [];
    history.push(ext);
    const updated: GymMember = {
      ...member,
      expirationDate: ext.newExpirationDate,
      status: 'Active',
      extensionHistory: history,
    };
    this.items.set(memberId, updated);
    return { ...updated };
  }

  async updateCheckInStatus(
    ctxOrMemberId: TenantQueryContext | string,
    memberIdOrStatus: string | 'Checked In' | 'Checked Out',
    occupancyStatusOrLocker?: 'Checked In' | 'Checked Out' | string | null,
    assignedLocker?: string | null
  ): Promise<GymMember | null> {
    const ctx = typeof ctxOrMemberId === 'object' ? ctxOrMemberId : undefined;
    const memberId = typeof ctxOrMemberId === 'string' ? ctxOrMemberId : (memberIdOrStatus as string);
    const occupancyStatus = typeof ctxOrMemberId === 'string' 
      ? (memberIdOrStatus as 'Checked In' | 'Checked Out') 
      : (occupancyStatusOrLocker as 'Checked In' | 'Checked Out');
    const locker = typeof ctxOrMemberId === 'string' 
      ? (occupancyStatusOrLocker as string | null) 
      : assignedLocker;

    const member = this.items.get(memberId);
    if (!member || member.deletedAt || !this.matchesTenant(member, ctx)) return null;
    const updated: GymMember = {
      ...member,
      occupancyStatus,
      assignedLocker: locker !== undefined ? locker : member.assignedLocker,
      lastCheckInTime:
        occupancyStatus === 'Checked In' ? new Date().toISOString() : member.lastCheckInTime,
    };
    this.items.set(memberId, updated);
    return { ...updated };
  }
}

export class InMemoryPlanRepository
  extends InMemoryRepository<BuiltPlan>
  implements IPlanRepository
{
  constructor() {
    super(MOCK_BUILT_PLANS);
  }

  async findByCategory(ctxOrCategory: TenantQueryContext | string, category?: string): Promise<BuiltPlan[]> {
    const ctx = typeof ctxOrCategory === 'object' ? ctxOrCategory : undefined;
    const cat = typeof ctxOrCategory === 'string' ? ctxOrCategory : category!;
    return Array.from(this.items.values()).filter(
      (p) => p.categoryTarget === cat && this.matchesTenant(p, ctx)
    );
  }
}

export class InMemoryLockerLogRepository
  extends InMemoryRepository<LockerLog>
  implements ILockerLogRepository
{
  constructor() {
    super(MOCK_LOCKER_LOGS);
  }

  async findRecentLogs(ctxOrLimit?: TenantQueryContext | number, limit = 50): Promise<LockerLog[]> {
    const ctx = typeof ctxOrLimit === 'object' ? ctxOrLimit : undefined;
    const maxLimit = typeof ctxOrLimit === 'number' ? ctxOrLimit : limit;
    const logs = Array.from(this.items.values()).filter((l) => this.matchesTenant(l, ctx));
    logs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return logs.slice(0, maxLimit);
  }

  async findLogsByMember(ctxOrMemberId: TenantQueryContext | string, memberId?: string): Promise<LockerLog[]> {
    const ctx = typeof ctxOrMemberId === 'object' ? ctxOrMemberId : undefined;
    const targetMemberId = typeof ctxOrMemberId === 'string' ? ctxOrMemberId : memberId!;
    return Array.from(this.items.values()).filter(
      (l) => l.memberId === targetMemberId && this.matchesTenant(l, ctx)
    );
  }
}

export class InMemoryLockerRepository
  extends InMemoryRepository<LockerStatusDetail>
  implements ILockerRepository
{
  // Per-tenant+location physical locker capacity. Not part of the generic CRUD
  // surface (it's a single configured value, not a collection of records), so
  // it's tracked separately rather than forced into the items Map.
  private capacities: Map<string, number> = new Map();

  constructor() {
    super([]);
  }

  private capacityKey(ctx?: TenantQueryContext): string {
    const tenantId = ctx?.tenantId || 'tenant-arche';
    const locationId = ctx?.locationId && ctx.locationId !== 'all' ? ctx.locationId : 'loc-downtown';
    return `${tenantId}:${locationId}`;
  }

  async upsertStatus(
    ctx: TenantQueryContext,
    lockerNumber: string,
    status: LockerCustomStatus,
    notes?: string,
    updatedBy?: string
  ): Promise<LockerStatusDetail> {
    const existing = this.items.get(lockerNumber);
    const updated: LockerStatusDetail = {
      id: lockerNumber,
      lockerNumber,
      tenantId: ctx.tenantId,
      locationId: ctx.locationId && ctx.locationId !== 'all' ? ctx.locationId : existing?.locationId,
      status,
      updatedAt: new Date().toISOString(),
      notes: notes ?? existing?.notes,
      updatedBy: updatedBy ?? existing?.updatedBy,
      deletedAt: null,
      deletedBy: null,
    };
    this.items.set(lockerNumber, updated);
    return { ...updated };
  }

  async getTotalCapacity(ctx?: TenantQueryContext): Promise<number> {
    return this.capacities.get(this.capacityKey(ctx)) ?? DEFAULT_LOCKER_CAPACITY;
  }

  async setTotalCapacity(ctx: TenantQueryContext, count: number): Promise<number> {
    const normalized = Math.max(1, Math.floor(count));
    this.capacities.set(this.capacityKey(ctx), normalized);
    return normalized;
  }
}

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

export class InMemoryMembershipTransactionRepository
  extends InMemoryRepository<MembershipTransaction>
  implements IMembershipTransactionRepository
{
  constructor() {
    super([]);
  }

  async findByMemberId(ctxOrMemberId: TenantQueryContext | string, memberId?: string): Promise<MembershipTransaction[]> {
    const ctx = typeof ctxOrMemberId === 'object' ? ctxOrMemberId : undefined;
    const targetMemberId = typeof ctxOrMemberId === 'string' ? ctxOrMemberId : memberId!;
    return Array.from(this.items.values()).filter(
      (tx) => tx.memberId === targetMemberId && this.matchesTenant(tx, ctx)
    );
  }
}

