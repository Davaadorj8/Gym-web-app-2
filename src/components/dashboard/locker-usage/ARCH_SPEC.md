# Directory Specification: src/components/dashboard/locker-usage

## 1. Architectural Alignment
- Layer Level: Level 2/3 (Dashboard Locker Usage Tab Views)
- Domain Scope: Locker overview card, floor grid, and locker logs table.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- `@/components/ui/*`
- `@/lib/*`
- `@/features/lockers` (LockerLog, calculateOccupancyMetrics — entity types/pure
  helpers, not actions)

## 3. Public API Exports (index.ts)
- `LockerOverviewCard`
- `LockerFloorGrid`
- `LockerLogsTable`

## 4. Maintenance Log
- [2026-09-04]: Created specification.
- [2026-09-05]: Backend domain-isolation pass — `LockerLogsTable` now imports
  `LockerLog` from `@/features/lockers` instead of `@/lib/types`; the parent
  `LockerUsageView` (`components/dashboard/`) imports `calculateOccupancyMetrics` from
  the same barrel instead of `@/lib/services`.
