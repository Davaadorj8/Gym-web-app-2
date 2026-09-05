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
- Plan: `calculatePlanFee`, `findPlanForMember`, plan-tier helpers
- Analytics: `calculateTotalMembershipValue`, `calculateWeeklyDistribution`,
  `calculateMembersByPlanTier`, `aggregateExtensionMetrics`, `calculateHourlyTraffic`
- Staff: `hasStaffPermission`, `DEFAULT_STAFF_PERMISSIONS`, `STAFF_SHIFTS`, `STAFF_ROLES`
- Pricing: `PricingService`
- Inventory: `getNutrientExpiryStatus`, `calculatePOTotal`, `calculateMarginPercent`,
  `isLowStock`, `isOutOfStock`

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
- 2026-09-04: Added `inventory.service.ts` (Phase B, Domain 3). `getNutrientExpiryStatus`
  relocated here from `src/lib/utils.ts` (a generic-utilities file, not the right home for
  domain logic); `calculatePOTotal`/`calculateMarginPercent`/`isLowStock`/`isOutOfStock`
  are new, replacing calculations that were previously duplicated inline across
  `InventoryView.tsx`, `PurchaseOrderModal.tsx`, and `analytics/NutrientsTab.tsx`.
- 2026-09-05: Rewrote `analytics.service.ts` (Phase B, Domain 5). This file already existed
  and was already documented above as the canonical home for these functions, but nothing
  actually imported it — every analytics tab component instead imported a parallel, drifted
  duplicate from `src/components/dashboard/analytics/analytics.types.ts` (wrong layer: a
  Level 2 component directory). The two copies disagreed: the component-layer duplicate had
  its own `resolveMemberCategory` (DOB/age-based) distinct from this directory's canonical
  one (`plan.service.ts`, used everywhere else — registration, extensions), and
  `calculateHourlyTraffic`/`calculateWeeklyDistribution` here read `member.lastCheckInTime`
  (one snapshot per member) instead of raw check-in event logs (used by the live version,
  which correctly reflects every historical check-in). Consolidated on the live, working
  implementations, moved here verbatim except for one real fix:
  `aggregateExtensionMetrics` now reads each `MembershipExtensionLog.memberCategory` (stamped
  at extension time via the canonical `resolveMemberCategory`) instead of recomputing a
  member's category fresh from current state — a member's category can change between two
  extensions, so re-deriving it discarded the historically-accurate stamped value. Also added
  `findPlanForMember` to `plan.service.ts`, replacing three duplicated inline
  `plans.find(p => p.id === m.planTitle)` lookups across `FinancialTab.tsx` and this file.
  Known, deliberately out-of-scope: registration
  (`src/features/registration/actions/index.ts`) never sets `GymMember.planCategory` for
  individual (non-organization) members, so `resolveMemberCategory` falls back to matching
  `planTitle` substrings against words like "under 18"/"corporate" — but `planTitle` for
  live-registered members actually holds the plan's `id` (`selectedPlanId`), not a display
  title, so that fallback never matches and such members default to `over18`. This is a
  pre-existing gap in the registration domain, not something this consolidation introduced
  or fixed; flagged here for a future registration-domain pass.
