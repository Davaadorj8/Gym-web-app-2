# Directory Specification: src/features/members

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature)
- Zachman Framework Cell: Owner (Business Concept) / What
- Domain Scope: Manages gym member entity lifecycles, member directory mutations, check-in operations, and member validation contracts.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/components/ui/* (Level 1 Primitives)
- @/components/* (Level 2 Shared Application Primitives)
- @/lib/* (Shared Utilities)
- @/lib/store/* (Typed Redux State)
- @/server/actions/* (Safe action wrappers)
- @/server/repositories/* (Server repository interface)

**Forbidden Imports:**
- Internal files of OTHER features (e.g., features/auth/components/*)
- Direct database instances (prisma or mock client) inside client components

## 3. Public API Exports (index.ts)
Only items listed below are exported for external consumption:
- Actions: registerMemberAction
- Schemas: CanonicalMemberSchema, CreateMemberSchema, MemberStatusSchema, OccupancyStatusSchema, CategoryTargetSchema
- Types: CanonicalMember, CreateMemberInput, MemberRecord

## 4. State & Data Lifecycle
- Server Data: Handled via Server Actions and repository access with tenant scoping.
- Client UI State: Member directory search, filters, pagination, and active check-in queue state.

## 5. Data Source Status
- [x] Mock data layer (default in-memory repositories)
- [ ] Real Neon Postgres via Prisma (only after user explicitly enables per Section 12)

## 6. Maintenance Log
- 2026-08-25: Initialized directory specification per Master System Instructions.
