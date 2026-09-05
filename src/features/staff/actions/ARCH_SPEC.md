# Directory Specification: src/features/staff/actions

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature / Logic)
- Zachman Framework Cell: How (Logic & Process) / Owner (Business Concept)
- Domain Scope: Server-side mutations and reads for staff accounts and shift attendance.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- ../types (Local Feature Types)
- ../repository (Local Feature Repository — `getStaffRepository`/`getStaffAttendanceRepository`)
- @/server/actions/safeAction (Action Wrapper)
- @/server/security/password (bcrypt hashing — server-only)
- zod (Validation)

## 3. Public API Exports (index.ts)
- `staff.ts`: registerStaffAction, updateStaffAction, deleteStaffAction,
  resetStaffPasswordAction, getStaffAction
- `attendance.ts`: clockInAction, clockOutAction, getAttendancesAction

## 4. State & Data Lifecycle
- Every action requires `tenantId` and passes it straight to the relevant repository.
- `registerStaffAction` checks `IStaffRepository.findByUsername` before creating, so a
  duplicate username is rejected server-side (`success: false`) even if the caller's local
  staff list is stale; it hashes the plaintext password via `hashPassword` and generates the
  staff id, mirroring the id-generation convention every other domain's create action
  follows (`registerMemberAction`, `addNutrientAction`, etc.).
- `resetStaffPasswordAction` is the only other place a password is hashed — it never
  receives or returns a pre-hashed value, closing the gap where `PasswordResetModal.tsx`
  used to hash client-side before this feature existed.
- `clockInAction` generates the attendance id server-side and returns the created record;
  `clockOutAction` looks the record up by that same id and marks it `COMPLETED`, so the
  client's optimistic mirror must wait for `clockInAction`'s response rather than invent its
  own id, or a later `clockOutAction` call would target a record the repository never wrote.
- Actions omit a `revalidateTarget` (matching every other feature's precedent) — these are
  fired from `DashboardContext` as background persistence alongside an optimistic local
  update, and a `revalidatePath` call needs a live Next.js request context that a plain
  Vitest unit test doesn't have.

## 5. Maintenance Log
- 2026-09-05: Backend domain-isolation pass. Repository access moved from
  `getStaffRepository`/`getStaffAttendanceRepository` imported off `@/server/repositories`
  to the same-named functions imported from the sibling `../repository` module, now that
  this domain owns its own repository.
