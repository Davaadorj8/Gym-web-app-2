# Directory Specification: src/server/repositories

## 1. Architectural Alignment
- Layer Level: Level 4 (Server Infrastructure / Data Access Layer)
- Zachman Framework Cell: Builder (Technology Physics) / What
- Domain Scope: Repository interfaces and mock in-memory data store implementations for members, plans, lockers, staff, and analytics.

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
  getLockerLogRepository, getLockerRepository, getStaffRepository,
  getMembershipTransactionRepository
- Types & interfaces: TenantQueryContext, CrudRepository, IMemberRepository, IPlanRepository,
  ILockerLogRepository, ILockerRepository, IStaffRepository, IMembershipTransactionRepository

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
