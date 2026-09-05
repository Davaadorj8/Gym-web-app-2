# Directory Specification: src/components/dashboard/checkin-desk

## 1. Architectural Alignment
- Layer Level: Level 2/3 (Dashboard Check-In Desk Tab Views)
- Domain Scope: Check-in logs, locker assignment modal, and capacity waitlist widget.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- `@/components/ui/*`
- `@/lib/*`
- `@/features/lockers` (LockerLog, LockerCustomStatus, isLockerUnavailableStatus —
  entity types/pure helpers, not actions)

## 3. Public API Exports (index.ts)
- `CheckInLogsTable`
- `LockerAssignmentModal`
- `CapacityWaitlistWidget`

## 4. Maintenance Log
- [2026-09-04]: Created specification.
- [2026-09-05]: Backend domain-isolation pass — `CheckInLogsTable` and
  `LockerAssignmentModal` now import `LockerLog`/`LockerCustomStatus`/
  `isLockerUnavailableStatus` from `@/features/lockers` instead of
  `@/lib/types`/`@/lib/services`.
