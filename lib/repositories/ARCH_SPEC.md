# Directory Specification: lib/repositories

## 1. Architectural Alignment
- Layer Level: Level 4 (Server Infrastructure / Data Access Layer)
- Zachman Framework Cell: Builder (Technology Physics) / What
- Domain Scope: Repository interfaces and mock in-memory data store implementations for members, plans, lockers, staff, and analytics.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/lib/types (Domain types)
- @/lib/db (Mock database helpers)

**Forbidden Imports:**
- Client UI components (@/components/*)
- Presentation layers and hooks
- Redux store

## 3. Public API Exports (index.ts)
- Repositories: memberRepository, planRepository, lockerRepository, staffRepository, analyticsRepository
- Types & interfaces: IMemberRepository, IPlanRepository, ILockerRepository, IStaffRepository, IAnalyticsRepository

## 4. State & Data Lifecycle
- Server-side persistence via repository pattern.
- Tenant isolation enforced across repository queries.

## 5. Data Source Status
- [x] Mock data layer (default in-memory repositories in lib/repositories/in-memory)
- [ ] Real Neon Postgres via Prisma (only after user explicitly enables per Section 12)

## 6. Maintenance Log
- 2026-08-25: Initialized directory specification per Master System Instructions.
