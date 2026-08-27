# Directory Specification: lib/services

## 1. Architectural Alignment
- Layer Level: Shared Utilities & Domain Services (Cross-cutting layer)
- Zachman Framework Cell: Builder (Technology Physics) / How
- Domain Scope: Domain logic services for data calculations, aggregations, and business rule enforcement.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/lib/types.ts (Domain entities)
- external libraries (date-fns, etc.)

**Forbidden Imports:**
- UI components
- Server actions or repositories (should be passed data via arguments)

## 3. Public API Exports (index.ts)
- `calculateTotalMembershipValue`
- `calculateWeeklyDistribution`
- `calculateMembersByPlanTier`
- `aggregateExtensionMetrics`
- `calculateHourlyTraffic`
- `calculateOccupancyMetrics`

## 4. State & Data Lifecycle
- Services are pure functions or stateless logic providers that operate on data passed from repositories or components.

## 5. Data Source Status
- [x] Stateless domain logic
- [ ] No direct DB dependency

## 6. Maintenance Log
- 2026-08-27: Initialized directory specification.
- 2026-08-27: Added `calculateHourlyTraffic` to `analytics.service.ts` to compute 24-hour member occupancy distribution from check-in data.
- 2026-08-27: Updated `calculateOccupancyMetrics` in `locker.service.ts` to support "Out of Service" locker tracking.
- 2026-08-27: Removed fallback mock count logic from `calculateWeeklyDistribution` in `analytics.service.ts` to ensure 100% accurate data reporting.
