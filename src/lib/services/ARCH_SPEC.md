# Directory Specification: src/lib/services

## 1. Architectural Alignment
- Layer Level: Shared Utilities & Domain Services (Cross-cutting layer)
- Zachman Framework Cell: Builder (Technology Physics) / How
- Domain Scope: Pure, stateless domain-calculation helpers for data calculations,
  aggregations, and business rule evaluation. Distinct from `@/server/services`, which
  holds the (small) set of domain services that read/write through repositories — see
  that directory's ARCH_SPEC.md for the split rationale.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/lib/types (Domain entities)
- @/lib/constants/* (Pricing config, etc.)
- external libraries (date-fns, etc.)

**Forbidden Imports:**
- UI components
- @/server/* (repositories, services, actions, security, db, prisma) — a function that
  needs repository access belongs in `@/server/services`, not here

## 3. Public API Exports (index.ts)
- Member: `computeNewExpirationDate`, `resolveMemberCategory`, `calculateExtensionFee`,
  `filterMembers`, `MemberFilterTab`
- Locker: `formatLockerNumber`, `generateLockerList`, `getNextAvailableLocker`,
  `getOccupiedLockers`, `isLockerUnavailableStatus`, `calculateOccupancyMetrics`
- Plan: `calculatePlanFee`, plan-tier helpers
- Analytics: `calculateTotalMembershipValue`, `calculateWeeklyDistribution`,
  `calculateMembersByPlanTier`, `aggregateExtensionMetrics`, `calculateHourlyTraffic`
- Staff: `hasStaffPermission`, `DEFAULT_STAFF_PERMISSIONS`, `STAFF_SHIFTS`, `STAFF_ROLES`
- Pricing: `PricingService`

## 4. State & Data Lifecycle
- Pure functions or stateless logic providers that operate only on data passed in as
  arguments — no repository, database, or I/O access of any kind.

## 5. Data Source Status
- [x] Stateless domain logic
- [ ] No direct DB dependency (by design — this directory must never gain one)

## 6. Maintenance Log
- 2026-08-27: Initialized directory specification (as part of the former combined
  lib/services, which also held repository-touching services at the time).
- 2026-09-04: Split during the src/ migration — the two repository-touching services
  (`MembershipStatusService`, `RefundService`) moved to `@/server/services`; this
  directory keeps only the pure calculation helpers, consistent with the "no direct DB
  dependency" status this ARCH_SPEC already claimed.
