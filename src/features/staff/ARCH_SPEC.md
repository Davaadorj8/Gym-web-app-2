# Directory Specification: src/features/staff

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature)
- Zachman Framework Cell: Owner (Business Concept) / What
- Domain Scope: Staff account registration/approval/directory management, and shift
  attendance (clock-in/clock-out). One feature module covers both entities: attendance
  records reference a staff account by id, and neither entity's lifecycle depends on the
  other's beyond that reference, so no cross-feature cascade is needed (unlike inventory's
  PO-receive cascade).

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/components/ui/* (Level 1 Primitives)
- @/components/* (Level 2 Shared Application Primitives)
- @/lib/* (Shared Utilities)
- @/server/actions/* (Safe action wrappers)
- @/server/repositories/in-memory/base, @/server/repositories/types (generic
  `InMemoryRepository<T>` base class and `CrudRepository`/`TenantQueryContext` contracts
  only — this domain's own repository implementation lives in this feature, see below)
- @/server/security/password (server-side password hashing)

**Forbidden Imports:**
- Internal files of OTHER features
- Direct database instances (prisma or mock client) inside client components

## 3. Public API Exports (index.ts)
- Staff account actions: registerStaffAction, updateStaffAction, deleteStaffAction,
  resetStaffPasswordAction, getStaffAction
- Attendance actions: clockInAction, clockOutAction, getAttendancesAction
- Schemas/types: StaffRoleSchema, StaffStatusSchema, RegisterStaffSchema, UpdateStaffSchema,
  DeleteStaffSchema, ResetStaffPasswordSchema, ClockInSchema, ClockOutSchema,
  RegisterStaffInput, UpdateStaffInput, DeleteStaffInput, ResetStaffPasswordInput,
  ClockInInput, ClockOutInput, StaffAccount, StaffAttendance, STAFF_PERMISSION_OPTIONS,
  MOCK_STAFF_ACCOUNTS — this domain's OWN entity types (`types/index.ts`), not
  re-exports from `@/lib/types` as of the Phase B domain-isolation pass (2026-09-05)
- Repository: IStaffRepository, IStaffAttendanceRepository, InMemoryStaffRepository,
  InMemoryStaffAttendanceRepository, getStaffRepository, getStaffAttendanceRepository
  (`repository.ts`) — `getStaffRepository()` is the same singleton `auth.config.ts`'s
  login lookup uses (see Section 4)

## 4. State & Data Lifecycle
- Server Data: Handled via Server Actions and repository access (`IStaffRepository`, which
  predates this feature and already backs `auth.config.ts`'s login lookup, and the new
  `IStaffAttendanceRepository`). Every write action requires `tenantId`.
- Password Handling: `registerStaffAction` and `resetStaffPasswordAction` are the only
  places a plaintext password is ever hashed — via `hashPassword` from
  `@/server/security/password` (bcrypt), executed server-side. Before this feature existed,
  `StaffRegistrationForm.tsx` and `PasswordResetModal.tsx` called `hashPassword` directly
  from a client component, a tracked architectural-debt item this extraction closes.
  `registerStaffAction` also owns username-uniqueness validation (`findByUsername`) so it
  can't be bypassed by a stale client-side staff list.
- Client Bridge: `src/lib/orchestration/DashboardContext.tsx` calls these actions from its
  staff-domain methods and fetches initial state via `getStaffAction`/`getAttendancesAction`
  on mount. `addStaff` and `clockIn` are async and return the server-created record (staff
  id and attendance id are both generated server-side, not by the caller) so a later
  `updateStaff`/`deleteStaff`/`clockOut` call by that id reliably targets the same backend
  record — the same class of fix applied to purchase-order ids in the inventory domain.

## 5. Data Source Status
- [x] Mock data layer (default in-memory repositories)
- [ ] Real Neon Postgres via Prisma (only after user explicitly enables per Section 12)

## 6. Maintenance Log
- 2026-09-05: Initialized as Phase B, Domain 4 of the DashboardContext extraction roadmap.
  Unlike check-ins, every callback (`addStaff`, `updateStaff`, `deleteStaff`, `clockIn`,
  `clockOut`) had real, live `useDashboard()` callers already, and unlike lockers/inventory
  there was no localStorage layer to remove either — `staffList` and `attendances` had zero
  persistence at all (`staffList` was plain in-memory React state seeded from a mock
  constant; `IStaffRepository` existed and backed login, but nothing on the dashboard side
  ever wrote through it). This extraction is the first time staff CRUD from the dashboard UI
  and staff lookup from auth read and write the same repository.
- 2026-09-05: Backend domain-isolation pass. This feature now owns its full stack:
  entity types (`types/index.ts`, moved from `@/lib/types/staff.types.ts`) and repository
  (`repository.ts`, moved from `@/server/repositories`) — previously this directory only
  owned Zod input schemas and re-exported entity types/repository access from shared
  modules every other domain also reached into. `auth.config.ts` and the dev-login route
  now import `getStaffRepository` from `@/features/staff` instead of
  `@/server/repositories` (the shared runtime data store is unchanged — same singleton,
  just reached through this feature's own barrel now). `DashboardContext.tsx` and the
  dashboard components that render staff data (`StaffApprovalsView`,
  `StaffDirectoryTable`, `StaffRegistrationForm`, `PasswordResetModal`,
  `ApprovalRequestsTab`) now import `StaffAccount` from `@/features/staff` instead of
  `@/lib/types`. Note: `auth.config.ts`'s own `LoginCredentialsSchema` import (from the
  separate `auth` feature) deliberately stays a deep import into
  `@/features/auth/schemas` rather than switching to that feature's barrel — see
  `src/features/auth/ARCH_SPEC.md`'s maintenance log for why.
