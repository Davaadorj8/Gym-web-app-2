# Directory Specification: src/features/lockers

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature)
- Zachman Framework Cell: Owner (Business Concept) / What
- Domain Scope: Manages physical locker inventory/status (not check-in/out occupancy,
  which is derived from `GymMember.assignedLocker` and stays in `lib/orchestration` until
  the check-in/out domain is extracted) and the locker event log.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/components/ui/* (Level 1 Primitives)
- @/components/* (Level 2 Shared Application Primitives)
- @/lib/* (Shared Utilities)
- @/server/actions/* (Safe action wrappers)
- @/server/repositories/* (Server repository interface)

**Forbidden Imports:**
- Internal files of OTHER features (e.g., features/members/actions/*)
- Direct database instances (prisma or mock client) inside client components

## 3. Public API Exports (index.ts)
Only items listed below are exported for external consumption:
- Actions: updateLockerStatusAction, setTotalLockersAction, logLockerEventAction,
  getLockerStatusesAction, getTotalLockersAction
- Schemas: LockerCustomStatusSchema, UpdateLockerStatusSchema, SetTotalLockersSchema,
  LogLockerEventSchema
- Types: UpdateLockerStatusInput, SetTotalLockersInput, LogLockerEventInput,
  LockerCustomStatus, LockerLog, LockerStatusDetail

## 4. State & Data Lifecycle
- Server Data: Handled via Server Actions and repository access with mandatory tenant
  scoping — every action's input schema requires `tenantId` (unlike some earlier feature
  actions, e.g. `registerMemberAction`, which predate this being enforced at the schema
  level).
- Client Bridge: `src/lib/orchestration/DashboardContext.tsx` calls these actions from its
  `updateLockerStatus`/`saveTotalLockers`/`logLockerEvent` methods and fetches initial
  state via `getLockerStatusesAction`/`getTotalLockersAction` on mount, so existing
  `useDashboard()` consumers (`LockerManagementTab`, `LockerUsageView`, `AnalyticsView`,
  `CheckInDeskView`) needed no changes.

## 5. Data Source Status
- [x] Mock data layer (default in-memory repositories)
- [ ] Real Neon Postgres via Prisma (only after user explicitly enables per Section 12)

## 6. Maintenance Log
- 2026-09-04: Initialized as Phase B, Domain 1 of the DashboardContext extraction roadmap.
  Replaces the previous `localStorage`-backed, unscoped locker status/capacity state with
  real tenant+location-scoped repository persistence, and gives the previously-orphaned
  `ILockerLogRepository` (built during the Foundation Phase but never consumed) its first
  writer.
