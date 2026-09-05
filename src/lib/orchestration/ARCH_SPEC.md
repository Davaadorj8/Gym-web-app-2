# Directory Specification: src/lib/orchestration

## 1. Architectural Alignment
- Layer Level: Cross-Cutting Orchestration & Context
- Zachman Framework Cell: Designer (System Logic) / How
- Domain Scope: Global React Context & State Provider managing UI state, session bridge (`useSession` integration), active branch location context (`TenantQueryContext`), and domain operations for Arche.fitness CRM.

*Note on Architecture:* `DashboardContext` operates as an application orchestration layer bridging NextAuth session state, multi-location state, and domain repositories.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- next-auth/react (useSession, signIn, signOut)
- @/lib/types (Domain models and location constants)
- @/lib/services/* (Pure calculation helpers)
- @/lib/utils/* (Helpers and audit utilities)
- @/server/repositories/* (Repository factories and types) — **tracked exception**, see below
- @/server/services/* (Membership status / refund services) — **tracked exception**, see below

**Forbidden Imports:**
- Level 1 UI Primitives or React presentation components
- Prisma Client directly (accesses repositories or mock state layer)

**Tracked exception:** this directory is the one place still allowed to import `@/server/*`
directly, enforced via the dedicated `orchestration` boundary type in `eslint.config.mjs`
(see the comment there). Every other `lib` file is blocked from reaching `server` — only
DashboardContext still reaches repositories/services directly instead of going through a
feature's actions, because six domains (lockers, check-in/out, inventory, suppliers, staff,
analytics) haven't been extracted into their own `features/*` modules yet. Remove this
exception, and this note, once that extraction (Phase B) is complete.

## 3. Public API Exports (index.ts)
- Context & Hook: DashboardProvider, useDashboard, DashboardContext
- Types: DashboardContextValue, AuthUser, UserRole

## 4. State & Data Lifecycle
- `currentUser` and `isAuthenticated` are derived reactively from NextAuth `useSession()`.
- `logout()` delegates to NextAuth's `signOut()`.
- `switchRole()` provides admin preview role simulation.
- Propagates `TenantQueryContext` down to domain repository operations.

## 5. Data Source Status
- [x] Mock data layer (default)
- [ ] Real Neon Postgres via Prisma

## 6. Maintenance Log
- 2026-08-28: Created ARCH_SPEC.md and added Phase 4 Multi-Tenant & Multi-Location Scaling.
- 2026-09-04: Migrated authentication state from manual useState/localStorage to NextAuth `useSession()` and `signOut()`.
