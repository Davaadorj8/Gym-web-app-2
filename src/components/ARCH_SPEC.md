# Directory Specification: src/components

## 1. Architectural Alignment
- Layer Level: Level 2 (Shared Application Primitives & Layout Wrappers)
- Zachman Framework Cell: Designer (System Logic) / Where
- Domain Scope: Application-wide shared UI modules, internationalization provider (I18nProvider), auth screens, and dashboard views.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/components/ui/* (Level 1 Primitives)
- @/lib/* (Shared Utilities, orchestration context, types)
- @/lib/store/* (Typed Redux Hooks & UI Slice)
- @/features/* (any domain's public barrel — as of the Phase B domain-isolation pass,
  2026-09-05, dashboard presentation components legitimately need read access to a
  domain's entity types since those aren't centralized in `@/lib/types` anymore;
  currently used: @/features/auth, @/features/registration, @/features/members,
  @/features/billing, @/features/lockers, @/features/staff, @/features/inventory,
  @/features/reporting — this is not an enumerated allow-list, any feature's barrel is
  permitted)

**Forbidden Imports:**
- Deep internal imports into feature internals (e.g. @/features/*/actions/*,
  @/features/*/components/*, @/features/*/repository) — barrel-only, still enforced
- Calling a feature's server actions or mutating its state from here — that stays the
  job of `orchestration` (`DashboardContext`) and `app`; this layer only reads types/pure
  helpers from a feature's barrel for rendering
- Direct database instances (prisma or mock client)

## 3. Public API Exports
- I18nProvider
- components/data-table/data-table (DataTable)
- components/stat-card (StatCard)
- components/ui (Level 1 Primitives)
- components/dashboard (Dashboard Views & Shell)
- components/auth (LoginScreen)

## 4. State & Data Lifecycle
- Composition layer bridging domain features and Level 1 UI primitives with Redux UI state and next-intl translations.

## 5. Data Source Status
- [x] Mock data layer (default)
- [ ] Real Neon Postgres via Prisma (only after user explicitly enables per Section 12)

## 6. Maintenance Log
- 2026-08-25: Initialized directory specification per Master System Instructions.
- 2026-09-03: Added DataTable and StatCard Level 2 primitives.
- 2026-09-05: Extended the `shared-ui` eslint-boundaries policy (`eslint.config.mjs`) to
  allow importing any `feature` element, not just the four barrels previously named here.
  Prompted by the Phase B domain-isolation pass moving lockers/staff/inventory's entity
  types out of `@/lib/types` into their own feature modules — components under
  `src/components/dashboard/{inventory,checkin-desk,locker-usage,staff-approvals,analytics}`
  that render those entities needed a legal way to import their prop types. The
  "barrel-only, no deep imports, no calling actions" rules are unchanged — only which
  features are reachable widened.
