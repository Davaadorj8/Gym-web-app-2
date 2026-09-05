// Mirrors the shape of server/repositories/types#TenantQueryContext without importing
// across the lib/server boundary — only tenantId/locationId are needed for cache keys.
interface TenantScope {
  tenantId: string;
  locationId?: string;
}

// Centralized query keys for tenant/location-scoped dashboard reads, so every
// call site (queries and cache invalidation alike) shares the same identity.
export const dashboardQueryKeys = {
  lockers: (ctx: TenantScope) => ['lockers', ctx.tenantId, ctx.locationId] as const,
  nutrients: (ctx: TenantScope) => ['nutrients', ctx.tenantId, ctx.locationId] as const,
  staff: (ctx: TenantScope) => ['staff', ctx.tenantId, ctx.locationId] as const,
  inventoryOps: (ctx: TenantScope) => ['inventory-ops', ctx.tenantId, ctx.locationId] as const,
};
