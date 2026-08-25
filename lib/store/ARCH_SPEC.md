# Directory Specification: lib/store

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

## 6. Maintenance Log
- 2026-08-25: Initialized directory specification per Master System Instructions.
