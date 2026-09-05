import { InMemoryRepository } from '@/server/repositories/in-memory/base';
import { CrudRepository, TenantQueryContext } from '@/server/repositories/types';
import { LockerLog, LockerStatusDetail, LockerCustomStatus, DEFAULT_LOCKER_CAPACITY, MOCK_LOCKER_LOGS } from './types';

export interface ILockerLogRepository extends CrudRepository<LockerLog, string> {
  findRecentLogs(ctxOrLimit?: TenantQueryContext | number, limit?: number): Promise<LockerLog[]>;
  findLogsByMember(ctxOrMemberId: TenantQueryContext | string, memberId?: string): Promise<LockerLog[]>;
}

export interface ILockerRepository extends CrudRepository<LockerStatusDetail, string> {
  upsertStatus(
    ctx: TenantQueryContext,
    lockerNumber: string,
    status: LockerCustomStatus,
    notes?: string,
    updatedBy?: string
  ): Promise<LockerStatusDetail>;
  getTotalCapacity(ctx?: TenantQueryContext): Promise<number>;
  setTotalCapacity(ctx: TenantQueryContext, count: number): Promise<number>;
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

const lockerRepository = new InMemoryLockerRepository();
const lockerLogRepository = new InMemoryLockerLogRepository();

export const getLockerRepository = () => lockerRepository;
export const getLockerLogRepository = () => lockerLogRepository;
