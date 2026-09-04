# Directory Specification: src/features/lockers/types

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature / Data)
- Zachman Framework Cell: What (Data & State) / Owner (Business Concept)
- Domain Scope: Type definitions and validation schemas for locker status, capacity, and
  locker event log entries.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- zod (Validation Library)
- @/lib/types (Global Types)

## 3. Public API Exports (index.ts)
- LockerCustomStatusSchema
- UpdateLockerStatusSchema, SetTotalLockersSchema, LogLockerEventSchema
- UpdateLockerStatusInput, SetTotalLockersInput, LogLockerEventInput
- LockerCustomStatus, LockerLog, LockerStatusDetail (re-exported from @/lib/types)
