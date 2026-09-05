# Directory Specification: src/server/repositories/in-memory

## 1. Architectural Alignment
- Layer Level: Persistence - In-Memory Repository Implementation
- Zachman Framework Cell: Operations / How
- Domain Scope: The generic `InMemoryRepository<T>` base class (`base.ts`) — domain-agnostic
  core infrastructure every domain's concrete repository builds on, whether it lives here
  (members, plans, membership transactions) or in a feature's own `repository.ts`
  (lockers, staff, inventory, as of the Phase B domain-isolation pass) — plus the
  concrete repositories for domains not yet extracted into their own feature module.
  State lives in process memory (resets on server restart, same as every other
  repository here) — not `localStorage`.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- `@/server/repositories/types`
- `@/lib/types`

## 3. Public API Exports
- `base.ts`: `InMemoryRepository<T>` (generic CRUD + tenant-scoping base class) — imported
  by both `index.ts` in this directory and by each feature's own `repository.ts`.
- `index.ts` (instantiated as singletons one level up, in `src/server/repositories/index.ts`):
  `InMemoryMemberRepository`, `InMemoryPlanRepository`,
  `InMemoryMembershipTransactionRepository`.

## 4. Maintenance Log
- 2026-08-28: Initialized in-memory repository specification.
- 2026-09-04: Corrected this doc to match the real exports (it previously named lowercase
  singleton instances and an `InMemoryCheckInRepository` that never existed — singletons are
  instantiated in `src/server/repositories/index.ts`, not here, and there was never a
  check-in repository). Added `InMemoryLockerRepository` (locker status/capacity — Phase B,
  Domain 1 of the DashboardContext extraction roadmap).
- 2026-09-05: Backend domain-isolation pass. Extracted the generic `InMemoryRepository<T>`
  class out of `index.ts` into its own `base.ts` file, then moved
  `InMemoryLockerRepository`/`InMemoryLockerLogRepository`,
  `InMemoryStaffRepository`/`InMemoryStaffAttendanceRepository`, and the five inventory
  repository classes out of `index.ts` entirely, into
  `src/features/{lockers,staff,inventory}/repository.ts` respectively (each importing the
  base class from `base.ts`). This directory now holds only the base class plus the
  member/plan/membership-transaction repositories, which stay here until Phase C.
