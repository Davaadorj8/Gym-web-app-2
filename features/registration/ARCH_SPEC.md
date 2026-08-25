# Directory Specification: features/registration

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature)
- Zachman Framework Cell: How (Logic & Process) / What
- Domain Scope: Manages member registration workflows (individual & organization), plan duration selection, form state modeling, and validation.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/components/ui/* (Level 1 Primitives)
- @/components/* (Level 2 Shared Application Primitives)
- @/lib/* (Shared Utilities)
- @/lib/store/* (Typed Redux State)
- @/lib/actions/* (Safe action wrappers)

**Forbidden Imports:**
- Internal files of OTHER features
- Direct database instances (prisma or mock client) inside client components

## 3. Public API Exports (index.ts)
Only items listed below are exported for external consumption:
- Actions: submitRegistrationAction
- Schemas: RegistrationSchema, MemberDetailSchema
- Types: RegistrationFormData, MemberDetail, createDefaultMember, getDefaultRegistrationValues

## 4. State & Data Lifecycle
- Server Data: Handled via Server Actions and repository persistence.
- Client UI State: Multistep/multisection registration form state managed via React Hook Form and Zod resolvers.

## 5. Data Source Status
- [x] Mock data layer (default in-memory repositories)
- [ ] Real Neon Postgres via Prisma (only after user explicitly enables per Section 12)

## 6. Maintenance Log
- 2026-08-25: Initialized directory specification per Master System Instructions.
