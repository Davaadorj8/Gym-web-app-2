# Directory Specification: src/server/repositories/in-memory

## 1. Architectural Alignment
- Layer Level: Persistence - In-Memory Repository Implementation
- Zachman Framework Cell: Operations / How
- Domain Scope: In-memory mock repositories conforming to repository contracts, scoped by
  tenant/location. State lives in process memory (resets on server restart, same as every
  other repository here) — not `localStorage`.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- `@/server/repositories/types`
- `@/lib/types`

## 3. Public API Exports
Exported as classes (instantiated as singletons one level up, in `src/server/repositories/index.ts`):
`InMemoryRepository<T>` (generic CRUD + tenant-scoping base class), `InMemoryMemberRepository`,
`InMemoryPlanRepository`, `InMemoryLockerLogRepository`, `InMemoryLockerRepository`,
`InMemoryStaffRepository`, `InMemoryMembershipTransactionRepository`.

## 4. Maintenance Log
- 2026-08-28: Initialized in-memory repository specification.
- 2026-09-04: Corrected this doc to match the real exports (it previously named lowercase
  singleton instances and an `InMemoryCheckInRepository` that never existed — singletons are
  instantiated in `src/server/repositories/index.ts`, not here, and there was never a
  check-in repository). Added `InMemoryLockerRepository` (locker status/capacity — Phase B,
  Domain 1 of the DashboardContext extraction roadmap).
