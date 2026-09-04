# Directory Specification: components

## 1. Architectural Alignment
- Layer Level: Level 2 (Shared Application Primitives & Layout Wrappers)
- Zachman Framework Cell: Designer (System Logic) / Where
- Domain Scope: Application-wide shared UI modules, internationalization provider (I18nProvider), auth screens, and dashboard views.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/components/ui/* (Level 1 Primitives)
- @/lib/* (Shared Utilities, orchestration context, types)
- @/lib/store/* (Typed Redux Hooks & UI Slice)
- @/features/* (Domain public barrels only: @/features/auth, @/features/registration, @/features/members, @/features/billing)

**Forbidden Imports:**
- Deep internal imports into feature internals (e.g. @/features/*/actions/*, @/features/*/components/*)
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
