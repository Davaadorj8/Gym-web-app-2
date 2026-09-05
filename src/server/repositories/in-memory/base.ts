import { CrudRepository, TenantQueryContext } from '../types';

// Generic in-memory CRUD base — domain-agnostic core infrastructure. Every domain's
// concrete repository (e.g. InMemoryMemberRepository in src/features/members/repository.ts)
// extends this rather than reimplementing tenant-scoping/soft-delete semantics.
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
