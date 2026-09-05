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
- @/lib/* (Shared Utilities; `@/lib/types` for the core `UserRole` identity type only —
  this domain's own entities are no longer sourced from there, see Section 3)
- @/server/actions/* (Safe action wrappers)
- @/server/repositories/in-memory/base, @/server/repositories/types (generic
  `InMemoryRepository<T>` base class and `CrudRepository`/`TenantQueryContext` contracts
  only — this domain's own repository implementation lives in this feature, see below)

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
  LockerCustomStatus, LockerLog, LockerStatusDetail, WaitlistEntry (dead subsystem,
  moved as-is — see `checkins/ARCH_SPEC.md`), DEFAULT_LOCKER_CAPACITY, LOCKER_PREFIX,
  MOCK_LOCKER_LOGS — this domain's OWN entity types (`repository.ts`), not re-exports
  from `@/lib/types` as of the Phase B domain-isolation pass (2026-09-05)
- Repository: ILockerRepository, ILockerLogRepository, InMemoryLockerRepository,
  InMemoryLockerLogRepository, getLockerRepository, getLockerLogRepository
  (`repository.ts`)
- Service: formatLockerNumber, generateLockerList, getOccupiedLockers,
  isLockerUnavailableStatus, countOutOfServiceLockers, getNextAvailableLocker,
  calculateOccupancyMetrics, LockerOccupancyMetrics (`service.ts` — pure calculation
  helpers, moved from `@/lib/services/locker.service.ts`)

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
- 2026-09-05: Backend domain-isolation pass. This feature now owns its full stack:
  entity types (`types/index.ts`, moved from `@/lib/types/lockers.types.ts`), repository
  (`repository.ts`, moved from `@/server/repositories`), and pure calculation helpers
  (`service.ts`, moved from `@/lib/services/locker.service.ts`) — previously this
  directory only owned Zod input schemas and re-exported entity types/repository access
  from shared modules every other domain also reached into. `DashboardContext.tsx` and
  the dashboard components that render locker data (`LockerUsageView`,
  `LockerAssignmentModal`, `LockerLogsTable`, `CheckInLogsTable`,
  `LockerManagementTab`/`LockerStatusUpdateForm` under `components/dashboard/inventory`,
  and the analytics `LockersTab`) now import `LockerCustomStatus`/`LockerLog`/etc. from
  `@/features/lockers` instead of `@/lib/types`.
