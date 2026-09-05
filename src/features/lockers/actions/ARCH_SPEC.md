# Directory Specification: src/features/lockers/actions

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature / Logic)
- Zachman Framework Cell: How (Logic & Process) / Owner (Business Concept)
- Domain Scope: Server-side reads and mutations for locker status, capacity, and the
  locker event log.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- ../types (Local Feature Types)
- @/server/actions/safeAction (Action Wrapper)
- @/server/repositories (Server Data Access)
- zod (Validation)

## 3. Public API Exports (index.ts)
- updateLockerStatusAction, setTotalLockersAction, logLockerEventAction
- getLockerStatusesAction, getTotalLockersAction

## 4. State & Data Lifecycle
- Every action requires `tenantId` (and accepts optional `locationId`) in its input and
  passes it straight through to the repository layer — no action here bypasses tenant
  scoping the way some earlier feature actions do.
