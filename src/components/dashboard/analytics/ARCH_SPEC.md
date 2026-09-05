# Directory Specification: src/components/dashboard/analytics

## 1. Architectural Alignment
- Layer Level: Level 2/3 (Dashboard Analytics Tab Views)
- Domain Scope: Financial, operational, plan, nutrient, locker, and member analytics. This
  directory holds only presentation (tab views, charts) and view-local UI state
  (`AnalyticsTab`, `PLAN_TIER_COLORS`) — every calculation the tabs render comes from
  `@/features/reporting` (cross-domain analytics) or `@/features/inventory`
  (nutrient-specific calculations), never computed locally.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- `@/components/ui/*`
- `@/lib/*`
- `@/features/reporting` (calculateWeeklyDistribution, calculateHourlyTraffic,
  calculateTotalMembershipValue, calculateMembersByPlanTier, aggregateExtensionMetrics)
- `@/features/inventory` (NutrientProduct, NutrientSaleLog, getNutrientExpiryStatus)
- `@/features/lockers` (LockerCustomStatus)
- `recharts`

**Forbidden Imports:**
- Calculation/aggregation logic must not be reimplemented here — add it to
  `@/features/reporting` (cross-domain) or the relevant domain's own `service.ts`
  (single-domain, e.g. inventory/lockers), even if a similar-looking calculation already
  exists locally. See Section 4 of the Maintenance Log for why this rule exists.

## 3. Public API Exports (index.ts)
- `FinancialTab`
- `OperationalTab`
- `PlansTab`
- `NutrientsTab`
- `LockersTab`
- `MembersTab`
- `AnalyticsTab` (UI tab-state type), `PLAN_TIER_COLORS` (chart palette) — from
  `analytics.types.ts`; both are view-local UI concerns, not business logic

## 4. Maintenance Log
- [2026-09-04]: Created specification.
- [2026-09-05]: `analytics.types.ts` used to also hold six calculation functions
  (`calculateWeeklyDistribution`, `calculateHourlyTraffic`, `calculateTotalMembershipValue`,
  `calculateMembersByPlanTier`, `aggregateExtensionMetrics`, plus a local
  `resolveMemberCategory`) that every tab in this directory imported. They duplicated —
  with drifted, disagreeing logic — the already-existing, already-documented-as-canonical
  `src/lib/services/analytics.service.ts`, which nothing actually imported. Moved the
  (corrected) implementations there and updated every tab's import; this directory now
  keeps only `AnalyticsTab` and `PLAN_TIER_COLORS`. See `src/lib/services/ARCH_SPEC.md`'s
  Maintenance Log for the full account, including the one real bug the consolidation fixed.
- [2026-09-05]: Backend domain-isolation pass. `analytics.service.ts` (the canonical
  home the entry above just established) was promoted from `@/lib/services` to a new
  `@/features/reporting` feature, since it structurally depends on both members' and
  billing's entity shapes — a dependency `lib` isn't allowed to have on a `feature`.
  `FinancialTab`, `OperationalTab`, `PlansTab`, and `MembersTab` now import the five
  calculation functions from `@/features/reporting` instead of `@/lib/services`.
  Separately, `NutrientsTab` now imports `NutrientProduct`/`NutrientSaleLog`/
  `getNutrientExpiryStatus` from `@/features/inventory` and `LockersTab` imports
  `LockerCustomStatus` from `@/features/lockers`, since those entity types moved out of
  the shared `@/lib/types` into their owning features in the same pass.
