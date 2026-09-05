# Directory Specification: src/components/dashboard/analytics

## 1. Architectural Alignment
- Layer Level: Level 2/3 (Dashboard Analytics Tab Views)
- Domain Scope: Financial, operational, plan, nutrient, locker, and member analytics. This
  directory holds only presentation (tab views, charts) and view-local UI state
  (`AnalyticsTab`, `PLAN_TIER_COLORS`) — every calculation the tabs render comes from
  `@/lib/services` (`analytics.service.ts`, `inventory.service.ts`), never computed locally.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- `@/components/ui/*`
- `@/lib/*`
- `recharts`

**Forbidden Imports:**
- Calculation/aggregation logic must not be reimplemented here — add it to
  `@/lib/services` instead and import it, even if a similar-looking calculation already
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
