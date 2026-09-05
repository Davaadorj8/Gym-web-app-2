# Directory Specification: src/features/reporting

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature — read-only)
- Zachman Framework Cell: Owner (Business Concept) / What
- Domain Scope: Pure, stateless analytics/reporting calculations that structurally
  depend on both members' and billing's data shapes (`GymMember`, `BuiltPlan`,
  `CategoryTarget`). No repository, no mutations, no domain state of its own — this
  feature exists to make that cross-domain dependency explicit and legal (a `feature`
  may depend on another domain's public barrel; `lib` may not depend on any `feature`
  at all) rather than hiding it inside `lib/services`, which is what happened before
  this feature existed.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/lib/types (`GymMember`, `BuiltPlan`, `CategoryTarget` — members/billing haven't been
  extracted into their own feature modules yet, so these still live in the shared
  `lib/types`; this feature's imports will repoint to `@/features/members`/
  `@/features/billing` once that Phase C extraction lands)
- @/lib/services (`resolveMemberCategory`, `findPlanForMember` — pure calculation
  helpers, stay centralized)

**Forbidden Imports:**
- Repositories, server actions, or any I/O — every function here takes already-fetched
  data as arguments and returns a pure computation.

## 3. Public API Exports (index.ts)
- `calculateWeeklyDistribution`, `calculateHourlyTraffic` — check-in event log
  aggregations (Mon-Sun distribution, hourly traffic)
- `calculateTotalMembershipValue` — real-time plan-price valuation of checked-in members
- `calculateMembersByPlanTier` — member counts per plan target-segment
- `aggregateExtensionMetrics` — renewal/extension revenue and category/period breakdowns
- Types: `WeeklyDistributionItem`, `HourlyTrafficItem`, `MembersByPlanTierItem`,
  `ExtensionLogEntry`, `ExtensionMetricsSummary`

## 4. State & Data Lifecycle
- Every function is pure: no repository calls, no I/O. Callers (the six analytics tab
  components under `src/components/dashboard/analytics/`) pass in already-fetched
  `members`/`plans`/log arrays from `DashboardContext`.

## 5. Maintenance Log
- 2026-09-05: Created as part of the Phase B backend domain-isolation pass, promoting
  `src/lib/services/analytics.service.ts` (deleted) to a feature. The functions
  themselves are unchanged from that file (see `src/lib/services/ARCH_SPEC.md`'s
  2026-09-05 maintenance-log entry for their own history) — only their location and
  layer classification changed, from a `lib` file with a disallowed implicit dependency
  on domain entity shapes, to a `feature` whose cross-domain dependency is explicit and
  sanctioned. Every real caller (`FinancialTab`, `OperationalTab`, `PlansTab`,
  `MembersTab`) now imports from `@/features/reporting` instead of `@/lib/services`.
