# Directory Specification: src/features/lockers/types

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature / Data)
- Zachman Framework Cell: What (Data & State) / Owner (Business Concept)
- Domain Scope: Owns the entity types for locker status/capacity and locker event log
  entries, plus their validation schemas. As of the Phase B domain-isolation pass
  (2026-09-05), these entity types are defined here directly — this directory is their
  source of truth, not a re-export of `@/lib/types`.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- zod (Validation Library)
- @/lib/types (`UserRole` only — the core identity type `LockerLog.staffRole` uses; no
  other type from `@/lib/types` should be imported here)

## 3. Public API Exports (index.ts)
- LockerCustomStatusSchema
- UpdateLockerStatusSchema, SetTotalLockersSchema, LogLockerEventSchema
- UpdateLockerStatusInput, SetTotalLockersInput, LogLockerEventInput
- LockerCustomStatus, LockerStatusDetail, LockerLog — owned entity types (not
  re-exported from `@/lib/types`)
- WaitlistEntry — dead subsystem (types/mock data exist, no real implementation or
  callers), moved here as-is; see `checkins/ARCH_SPEC.md` for the flag
- DEFAULT_LOCKER_CAPACITY, LOCKER_PREFIX, MOCK_LOCKER_LOGS

## 4. Maintenance Log
- 2026-09-05: Backend domain-isolation pass. Moved `LockerCustomStatus`,
  `LockerStatusDetail`, `LockerLog`, `WaitlistEntry`, `DEFAULT_LOCKER_CAPACITY`,
  `LOCKER_PREFIX`, and `MOCK_LOCKER_LOGS` here from `@/lib/types/lockers.types.ts`
  (deleted). `UserRole` (used by `LockerLog.staffRole`) now comes from
  `@/lib/types/identity.types.ts` instead of `@/lib/types/staff.types.ts` — removing a
  direct dependency this domain's shared-kernel type used to have on the staff domain's.
