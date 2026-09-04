# Directory Specification: src/features/checkins

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature)
- Zachman Framework Cell: Owner (Business Concept) / What
- Domain Scope: Member gym check-in/check-out — updates a member's occupancy status and
  assigned locker atomically. Does **not** own locker status/capacity or the locker event
  log (those stay in `src/features/lockers`); the caller (`DashboardContext`) is
  responsible for logging the locker event via that feature's `logLockerEvent`, so this
  module stays single-responsibility rather than reaching into `lockers` for a side effect
  the caller already handles.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/server/actions/* (Safe action wrappers)
- @/server/repositories/* (Server repository interface)
- zod (Validation)

**Forbidden Imports:**
- Internal files of OTHER features (e.g., features/lockers/actions/*) — this module has no
  need to reach into lockers; if that ever changes, import from `@/features/lockers`'s
  public barrel only, never a deep path
- Direct database instances (prisma or mock client) inside client components

## 3. Public API Exports (index.ts)
- Actions: checkInMemberAction, checkOutMemberAction
- Schemas: CheckInMemberSchema, CheckOutMemberSchema
- Types: CheckInMemberInput, CheckOutMemberInput

## 4. State & Data Lifecycle
- Server Data: Wraps `IMemberRepository.updateCheckInStatus` (already existed, previously
  unused — see Maintenance Log) with tenant scoping. Both actions require `tenantId`.
- Client Bridge: `src/lib/orchestration/DashboardContext.tsx`'s `checkInMember`/
  `checkOutMember` call these actions alongside their existing optimistic local state
  update and their existing `logLockerEvent` call (unchanged) — this feature only owns the
  member-occupancy write.

## 5. Data Source Status
- [x] Mock data layer (default in-memory repositories)
- [ ] Real Neon Postgres via Prisma (only after user explicitly enables per Section 12)

## 6. Maintenance Log
- 2026-09-04: Initialized as Phase B, Domain 2 of the DashboardContext extraction roadmap.
  `DashboardContext.checkInMember`/`checkOutMember` were confirmed dead code before this
  change (zero callers) — the real check-in/out UI (`CheckInDeskView.tsx`) called
  `dashboard.updateMember()` directly and never logged a locker event in production (an
  optional `propOnLogLockerEvent` prop was never supplied by any real render site). This
  extraction wires `CheckInDeskView` through `dashboard.checkInMember`/`checkOutMember`
  instead, which both persists via `updateCheckInStatus` (previously built, never called)
  and logs the locker event for real, closing that gap. A separate, entirely unused
  waitlist subsystem (`joinWaitlist`/`leaveWaitlist`/`claimWaitlistOffer`, `WaitlistEntry`,
  and `checkOutMember`'s dormant auto-reserve-on-waitlist logic) was found during this
  work and is explicitly **not** touched here — flagged as dead code for a future cleanup
  pass, not resurrected or removed as a side effect of this extraction.
