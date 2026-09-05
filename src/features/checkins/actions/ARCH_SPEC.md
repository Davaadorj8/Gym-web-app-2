# Directory Specification: src/features/checkins/actions

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature / Logic)
- Zachman Framework Cell: How (Logic & Process) / Owner (Business Concept)
- Domain Scope: Server-side mutations for member check-in and check-out.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- ../types (Local Feature Types)
- @/server/actions/safeAction (Action Wrapper)
- @/server/repositories (Server Data Access)

## 3. Public API Exports (index.ts)
- checkInMemberAction, checkOutMemberAction

## 4. State & Data Lifecycle
- Both actions require `tenantId` and pass it straight to
  `IMemberRepository.updateCheckInStatus`. Neither action touches locker logs — that
  remains the caller's responsibility (see the parent ARCH_SPEC.md).
- Deliberately created without a `revalidateTarget` (unlike `registerMemberAction`,
  which passes `"/dashboard"`) — these are fired from `DashboardContext` as
  fire-and-forget background persistence alongside an optimistic local state update, the
  same pattern `src/features/lockers/actions` already uses, none of which pass one either.
  A `revalidateTarget` calls `revalidatePath`, which needs a live Next.js request context;
  passing one here broke plain Vitest unit tests calling the action directly and wasn't
  buying anything real, since the UI already updates from local state, not a revalidated
  server-rendered page.
