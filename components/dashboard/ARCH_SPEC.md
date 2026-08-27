# Directory Specification: components/dashboard

## 1. Architectural Alignment
- Layer Level: Level 2 (Shared Application Primitives & Dashboard Views)
- Zachman Framework Cell: Designer (System Logic) / Where
- Domain Scope: Application dashboard views (CheckInDeskView, MemberDirectoryView, RegistrationView, AnalyticsView, InventoryView, LockerUsageView, StaffApprovalsView) and DashboardShell.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/components/ui/* (Level 1 Primitives)
- @/lib/* (Shared Utilities, orchestration context, types)
- @/lib/store/* (Typed Redux Hooks & UI Slice)
- @/features/* (Domain public barrels only: @/features/registration, @/features/members, etc.)

**Forbidden Imports:**
- Deep internal imports into feature internals (e.g. @/features/*/components/*)
- Direct Prisma DB instances inside client components

## 3. Public API Exports (index.ts / default exports)
- DashboardShell
- CheckInDeskView
- MemberDirectoryView
- RegistrationView
- AnalyticsView
- InventoryView
- LockerUsageView
- StaffApprovalsView
- Sidebar

## 4. State & Data Lifecycle
- Global UI State: Redux store (uiSlice) for active tab, sidebar toggle, locale, and theme preferences.
- Domain Context: DashboardContext orchestration provider for synchronized view actions.

## 5. Data Source Status
- [x] Mock data layer / in-memory repositories via server actions & orchestration context
- [ ] Real Neon Postgres via Prisma (only after user explicitly enables per Section 12)

## 6. Maintenance Log
- 2026-08-25: Initialized directory specification per Master System Instructions.
- 2026-08-25: Switched dynamic imports in DashboardShell to direct component imports to eliminate Turbopack runtime chunk loading errors.
- 2026-08-25: Updated brand title display to Arche.fitness in Sidebar and DashboardShell.
- 2026-08-27: Replaced "Revenue by Plan" BarChart with "Hourly Members Traffic" AreaChart in AnalyticsView.tsx; integrated new hourly distribution logic from analytics service.
- 2026-08-27: Merged "Weekly Check-in" and "Hourly Traffic" charts into a single interactive "Traffic Analysis" card with a toggle switch.
