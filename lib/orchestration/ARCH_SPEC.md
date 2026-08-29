# Directory Specification: lib/orchestration

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Domain Orchestration)
- Zachman Framework Cell: Designer (System Logic) / How
- Domain Scope: Global React Context & State Provider managing UI state, authentication session, active branch location context (TenantQueryContext), and domain actions for Arche.fitness CRM.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/lib/types (Domain models and location constants)
- @/lib/repositories/types (TenantQueryContext)
- @/lib/utils/* (Helpers and audit utilities)

**Forbidden Imports:**
- Level 1 UI Primitives or React components
- Prisma Client directly (accesses repositories or mock state layer)

## 3. Public API Exports (index.ts)
- Context & Hook: DashboardProvider, useDashboard, DashboardContext
- Types: DashboardContextValue

## 4. State & Data Lifecycle
- React Context holds tenantId, location list, selectedLocationId, and tenantContext.
- Propagates TenantQueryContext down to domain repository operations.

## 5. Data Source Status
- [x] Mock data layer (default)
- [ ] Real Neon Postgres via Prisma

## 6. Maintenance Log
- 2026-08-28: Created ARCH_SPEC.md and added Phase 4 Multi-Tenant & Multi-Location Scaling (selectedLocationId, tenantContext, Branch Switcher bindings).
