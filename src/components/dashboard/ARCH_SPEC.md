# Directory Specification: src/components/dashboard

## 1. Architectural Alignment
- Layer Level: Level 2 (Shared Application Primitives & Dashboard Views)
- Zachman Framework Cell: Designer (System Logic) / Where
- Domain Scope: Application dashboard views (CheckInDeskView, MemberDirectoryView, RegistrationView, AnalyticsView, InventoryView, LockerUsageView, StaffApprovalsView) and DashboardShell.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/components/ui/* (Level 1 Primitives)
- @/lib/* (Shared Utilities, orchestration context, types)
- @/lib/store/* (Typed Redux Hooks & UI Slice)
- @/features/* (any domain's public barrel — not an enumerated allow-list; see
  `src/components/ARCH_SPEC.md`'s 2026-09-05 maintenance-log entry for why this widened
  from the original four)

**Forbidden Imports:**
- Deep internal imports into feature internals (e.g. @/features/*/components/*,
  @/features/*/repository)
- Calling a feature's server actions or mutating its state from a view — reading a
  type/pure helper from a feature's barrel is fine, orchestrating a mutation isn't
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
- 2026-08-27: Refactored LockerUsageView.tsx metrics into a single "Locker Status Overview" card with a "Total = Free / Occupied / Out" breakdown; updated locker service and translations accordingly.
- 2026-08-27: Restructured AnalyticsView.tsx into 5 switch tabs (Financial, Operational, Plan (Product), Locker, Members) with dedicated KPI strips, domain visualizations, product catalog table, locker floor status, and searchable extension audit logs. Added full EN/MN i18n support for tab titles and header subtitles.
- 2026-08-27: Added missing translation keys for English and Mongolian locales under the Analytics namespace (`hourlyTrafficTitle`, `hourlyTrafficSubtitle`, `lockerStatusOverview`, `lockerStatusBreakdown`, `totalCapacity`, `lockersAvailable`, `currentlyOccupied`, `underService`, `utilizationRate`).
- 2026-08-27: Connected AnalyticsView.tsx locker metrics to `dashboard.totalLockers` to pull total capacity dynamically from Inventory -> Lock Capacity Settings instead of hardcoded values.
- 2026-08-27: Removed duplicate `dashboard` menu entry from Sidebar.tsx to eliminate redundancy where both Dashboard and Analytics mapped to AnalyticsView.
- 2026-08-28: Merged Extensions by Category and Extensions by Period charts in AnalyticsView.tsx into a single switchable graph card with interactive toggle controls, preserving real calculation data.
- 2026-08-28: Synchronized custom locker maintenance statuses (`clean`, `repair`, `key_lost`, `key_not_returned`, `inactive`) across all locker-related views (`InventoryView`, `CheckInDeskView`, `LockerUsageView`, `AnalyticsView`, and `locker.service.ts`). Out-of-service and maintenance lockers are automatically excluded from check-in availability and reflected in centralized metrics.
- 2026-08-28: Integrated Nutrient Inventory state into `DashboardContext.tsx` and added dedicated `nutrients` tab in `AnalyticsView.tsx` with single switchable graph card (Stock Volume, Valuation, Stock Health), KPI metrics strip, financial tab integration, and filterable product breakdown table.
- 2026-08-28: Added missing `tabNutrients` translation keys to both EN and MN message catalogs in `/lib/messages.ts`, configured `onError` and `getMessageFallback` handlers in `I18nProvider.tsx`, and updated `AnalyticsView.tsx` tab label evaluation with `t.has()` safety fallbacks.
- 2026-08-28: Implemented unit price immutability for nutrient sales (`unitPriceAtSale`), integrated historical sales revenue KPI, added 'Sales Revenue' view option to the switchable nutrient graph, and created historical sales audit log table in `AnalyticsView.tsx`.
- 2026-08-28: Optimized LockerUsageView with high-contrast `amber-400` status color mapping for legend badges, grid cells, and icons to meet WCAG AA standards.
- 2026-08-28: Configured DashboardShell with active boundary resize listeners to auto-collapse the sidebar on tablet ranges (768px - 1024px) only on transition, preserving manual expansion preferences.
- 2026-08-28: Redesigned the registration progress bar (`registration-stages-progress`) into a sticky, high-density, glassmorphic 4-stage stepper; cleared default payment pre-selection to enforce manual choice.
- 2026-08-28: Integrated a beautiful, intuitive tab switcher into the staff core actions panel (`card-register-staff-form`), with Tab 1 for "Register New Staff Member" and Tab 2 for interactive "Notifications & Approval Requests" complete with live count badges, yes/no approvals, and system compliance logs.
- 2026-08-28: Implemented Phase 3 features: Clock In/Out staff shift console in DashboardShell; live Gym Capacity monitoring & Locker/Gym waitlist queues with automated matching/reservation triggers in CheckInDeskView; recent check-in activity logs with "Processed by [Staff Name]" correlation; and registered supplier directory with interactive Purchase Order creation, status pipeline, and stock intake logs with gross margins in InventoryView.
- 2026-09-04: Phase 1 & Phase 2 Structural Cleanup and Shared Primitives for InventoryView: Extracted NutrientModal, NutrientSaleModal, and PurchaseOrderModal into components/dashboard/inventory/, reducing InventoryView monolith to a clean ~200 lines. Built Level 2 shared StatCard and DataTable primitives in components/dashboard/. Tightened spacing scale to compact defaults (p-3/p-4, gap-2).
- 2026-09-04: Phase 4 Dynamic Rendering & Route-Based Code Splitting: Converted activeTab client switch into real Next.js App Router dynamic routes (`app/dashboard/[tab]/page.tsx`). Converted all 7 tab views to lazy dynamic imports via `next/dynamic` with Suspense fallback skeleton loaders (`ViewSkeleton`). Enabled deep-linking and full browser history / back-button navigation per tab while maintaining single-source DashboardContext orchestration.
- 2026-09-04: Cleaned up redundant dynamic imports and dead fallback ternary chain in DashboardShell.tsx, passing route children cleanly from layout.tsx.
- 2026-09-04: Fixed sidebar rendering and session hydration safety: updated `hasStaffPermission` and `Sidebar` to provide safe user fallbacks during NextAuth session loading so menu items are never filtered out to empty array; added `sticky top-0 h-screen z-20` and overflow handling to persistent desktop sidebar container.
- 2026-09-04: Simplified Sidebar navigation item visibility rule: explicit bypass for admin roles (`if (isAdmin) return true;`) so all menu navigation items and check-in controls are accessible without being erroneously gated by staff permissions.
- 2026-09-04: Fixed dashboard view content hiding bug in `app/dashboard/[tab]/page.tsx`: removed premature `!isAuthenticated` blocking check that caused infinite `ViewSkeleton` rendering when visiting tabs directly or with demo user state. Added safe promise unwrapping for route params.
- 2026-09-05: Backend domain-isolation pass repointed several views'/tables'/modals'
  entity-type imports from `@/lib/types` to the owning feature's barrel:
  `LockerUsageView`, `CheckInDeskView`, `InventoryView`, `StaffApprovalsView`, and
  components under `checkin-desk/`, `locker-usage/`, `inventory/`, `staff-approvals/`,
  and `analytics/` (see each of those subdirectories' own ARCH_SPEC.md). No rendering
  logic changed — see `src/components/ARCH_SPEC.md`'s matching entry for the underlying
  eslint-boundaries policy change this required.

