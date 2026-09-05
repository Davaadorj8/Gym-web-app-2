# Directory Specification: src/lib/orchestration

## 1. Architectural Alignment
- Layer Level: Cross-Cutting Orchestration & Context
- Zachman Framework Cell: Designer (System Logic) / How
- Domain Scope: Global React Context & State Provider managing UI state, session bridge (`useSession` integration), active branch location context (`TenantQueryContext`), and domain operations for Arche.fitness CRM.

*Note on Architecture:* `DashboardContext` operates as an application orchestration layer bridging NextAuth session state, multi-location state, and domain repositories.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- next-auth/react (useSession, signIn, signOut)
- @/lib/types (Members/billing domain models — not yet extracted — and Redux-adjacent
  UI-only concerns; NOT the shared kernel it once was for every domain's entities)
- @/lib/services/* (Pure calculation helpers not yet owned by a specific feature)
- @/lib/utils/* (Helpers and audit utilities)
- @/features/* (lockers, checkins, inventory, staff — public barrels; the four domains
  already extracted into their own feature module reach this context only through their
  actions/types, per the standard `feature` boundary, same as any other caller)
- @/server/repositories/* (Repository factories and types, for `members`/`plans`/
  membership-transaction access) — **tracked exception**, see below
- @/server/services/* (Membership status / refund services) — **tracked exception**, see below

**Forbidden Imports:**
- Level 1 UI Primitives or React presentation components
- Prisma Client directly (accesses repositories or mock state layer)

**Tracked exception:** this directory is the one place still allowed to import `@/server/*`
directly, enforced via the dedicated `orchestration` boundary type in `eslint.config.mjs`
(see the comment there). Every other `lib` file is blocked from reaching `server`. As of
the Phase B domain-isolation pass (2026-09-05), this exception is now scoped to exactly
the three domains that haven't been extracted into their own `features/*` module yet:
**members, billing, registration** — their action layers are currently dead code (real
member/billing mutation happens via `getMemberRepository()`/`getMembershipTransactionRepository()`
calls made directly here, and `MembershipStatusService`/`RefundService` from
`@/server/services`, all bypassing any feature action). Lockers, check-ins, inventory,
and staff are fully extracted — this context reaches all four exclusively through their
feature barrels now (`@/features/lockers`, `@/features/checkins`, `@/features/inventory`,
`@/features/staff`), including for their entity types (previously sourced from
`@/lib/types`, now from each feature's own barrel). Remove this exception, and this note,
once the members/billing/registration extraction (Phase C) is complete — that phase is
the one place in the whole domain-isolation effort where fixing this is genuinely
behavior-changing (their actions currently have zero real callers), not just relocation,
which is why it was deliberately deferred out of Phase B.

## 3. Public API Exports (index.ts)
- Context & Hook: DashboardProvider, useDashboard, DashboardContext
- Types: DashboardContextValue, AuthUser, UserRole

## 4. State & Data Lifecycle
- `currentUser` and `isAuthenticated` are derived reactively from NextAuth `useSession()`.
- `logout()` delegates to NextAuth's `signOut()`.
- `switchRole()` provides admin preview role simulation.
- Propagates `TenantQueryContext` down to domain repository operations.

## 5. Data Source Status
- [x] Mock data layer (default)
- [ ] Real Neon Postgres via Prisma

## 6. Maintenance Log
- 2026-08-28: Created ARCH_SPEC.md and added Phase 4 Multi-Tenant & Multi-Location Scaling.
- 2026-09-04: Migrated authentication state from manual useState/localStorage to NextAuth `useSession()` and `signOut()`.
- 2026-09-05: Backend domain-isolation pass. Repointed every locker/staff/inventory
  entity-type import (`LockerLog`, `LockerCustomStatus`, `WaitlistEntry`, `StaffAccount`,
  `StaffAttendance`, `NutrientProduct`, `NutrientSaleLog`, `Supplier`, `PurchaseOrder`,
  `POItem`, `StockIntakeLog`, plus their `MOCK_*` seed constants) from `@/lib/types` to
  each domain's own feature barrel, and locker calculation helpers
  (`formatLockerNumber`/`generateLockerList`/`getNextAvailableLocker`/`getOccupiedLockers`)
  from `@/lib/services` to `@/features/lockers`. No logic changed — this context's
  `members`/`billing`-related direct-repository/direct-service calls are untouched
  (deferred to Phase C, see the tracked-exception note above).
