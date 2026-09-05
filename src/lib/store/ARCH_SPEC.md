# Directory Specification: src/lib/store

## 1. Architectural Alignment
- Layer Level: Cross-cutting / State Management
- Zachman Framework Cell: Designer (System Logic) / What (Data & State)
- Domain Scope: Global client UI state management (drawer toggles, active filter presets, search query, active modals).

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @reduxjs/toolkit
- react-redux
- @/lib/* (Utilities & constants)

**Forbidden Imports:**
- Server database models (prisma, repositories)
- Business feature server actions

## 3. Public API Exports (index.ts)
- makeStore, StoreProvider
- AppStore, RootState, AppDispatch
- useAppDispatch, useAppSelector, useAppStore
- uiSlice, setSidebarOpen, toggleSidebar, setActiveFilterPreset, setSearchQuery, setActiveModal

## 4. State & Data Lifecycle
- Per-request store initialization using makeStore factory wrapped in StoreProvider.
- Manages client-only UI interaction state.

## 5. Data Source Status
- Not applicable (Client UI State)

## 6. Status Note
`uiSlice` currently has zero real consumers — mounted via `StoreProvider` in `app/layout.tsx`
but nothing dispatches or selects from it yet. This is **reserved, not abandoned**: it is the
designated landing spot for the pure client-UI-state fields currently living inside
`lib/orchestration/DashboardContext.tsx` (e.g. `sidebarCollapsed`, `directoryFilter`), which
will move here incrementally as each domain's state is extracted out of DashboardContext into
its own `features/*` module (see the "orchestration" boundary note in `eslint.config.mjs`).
Do not delete this directory; do not treat it as legacy scaffolding to clean up.

## 7. Maintenance Log
- 2026-08-25: Initialized directory specification per Master System Instructions.
- 2026-09-04: Moved to src/lib/store during the src/ migration; added Section 6 status note
  clarifying this is reserved infrastructure, not dead code, pending Phase B domain extraction.
