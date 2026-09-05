# Directory Specification: src/server/repositories

## 1. Architectural Alignment
- Layer Level: Level 4 (Server Infrastructure / Data Access Layer)
- Zachman Framework Cell: Builder (Technology Physics) / What
- Domain Scope: Generic, domain-agnostic repository core (the `CrudRepository`/
  `TenantQueryContext` contracts and the `InMemoryRepository<T>` base class in
  `in-memory/base.ts`) plus the repository interfaces/implementations/singletons for
  domains that haven't been extracted into their own feature module yet: members, plans,
  and membership transactions (billing). Lockers', staff's, and inventory's repository
  interfaces, concrete classes, and singleton getters moved into their own
  `src/features/<domain>/repository.ts` as of the Phase B domain-isolation pass
  (2026-09-05) — this directory no longer holds them, and must not gain new
  domain-specific repositories going forward; a new domain's repository belongs in that
  domain's own feature folder from the start.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/lib/types (Domain types)
- @/server/db (Mock database helpers)

**Forbidden Imports:**
- Client UI components (@/components/*)
- Presentation layers and hooks
- Redux store

## 3. Public API Exports (index.ts)
- Getters (module-level singletons): getMemberRepository, getPlanRepository,
  getMembershipTransactionRepository
- Types & interfaces: TenantQueryContext, CrudRepository (generic core, `types.ts`),
  IMemberRepository, IPlanRepository, IMembershipTransactionRepository

## 4. State & Data Lifecycle
- Server-side persistence via repository pattern.
- Tenant isolation enforced across repository queries.

## 5. Data Source Status
- [x] Mock data layer (default in-memory repositories in server/repositories/in-memory)
- [ ] Real Neon Postgres via Prisma (only after user explicitly enables per Section 12)

## 6. Maintenance Log
- 2026-08-25: Initialized directory specification per Master System Instructions.
- 2026-08-28: Updated interfaces and InMemoryRepository to support Phase 4 TenantQueryContext (tenantId & locationId) scoping across all domain entities.
- 2026-09-04: Corrected the Public API Exports list to match reality (`index.ts` exports
  zero-arg getter functions returning singletons, not bare instance names; there was never
  an `analyticsRepository`/`IAnalyticsRepository`). Added `ILockerRepository` /
  `getLockerRepository()` for locker status/capacity (Phase B, Domain 1 of the
  DashboardContext extraction roadmap) — this repository interface was named in this doc
  before the real code existed; it's now accurate.
- 2026-09-04: `IMemberRepository.updateCheckInStatus` gained its first real caller
  (`src/features/checkins`, Phase B Domain 2) — it was fully implemented but had zero
  callers before this; `CheckInDeskView` previously mutated check-in/out state through the
  generic `.update()` method instead.
- 2026-09-05: Backend domain-isolation pass. Moved `ILockerRepository`/
  `ILockerLogRepository` (+ `InMemoryLockerRepository`/`InMemoryLockerLogRepository` and
  their singleton getters) to `src/features/lockers/repository.ts`; `IStaffRepository`/
  `IStaffAttendanceRepository` (+ implementations/getters) to
  `src/features/staff/repository.ts`; and `INutrientRepository`/`INutrientSaleRepository`/
  `ISupplierRepository`/`IPurchaseOrderRepository`/`IStockIntakeRepository` (+
  implementations/getters, kept together per inventory's own atomic-PO-receipt
  rationale) to `src/features/inventory/repository.ts`. The generic
  `InMemoryRepository<T>` base class moved to `in-memory/base.ts` so both this directory
  and every feature's own `repository.ts` build on the same domain-agnostic core instead
  of each domain reaching into a single shared file holding every domain's persistence.
  `members`/`plans`/`membershipTransaction` repositories stay here for now — moving them
  is Phase C, deferred (their feature action layers are currently dead code, bypassed by
  `DashboardContext`, so extracting their repositories first wouldn't be meaningful).
