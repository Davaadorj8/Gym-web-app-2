# Directory Specification: src/features/billing

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature)
- Zachman Framework Cell: When (Lifecycle) / What (Data & State)
- Domain Scope: Manages subscription tiers, invoicing actions, payment processing contracts, and billing schemas.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/components/ui/* (Level 1 Primitives)
- @/components/* (Level 2 Shared Application Primitives)
- @/lib/* (Shared Utilities)
- @/lib/store/* (Typed Redux State)
- @/server/actions/* (Safe action wrappers)

**Forbidden Imports:**
- Internal files of OTHER features
- Direct database instances (prisma or mock client) inside client components

## 3. Public API Exports (index.ts)
Only items listed below are exported for external consumption:
- Actions: createInvoiceAction, getPlanTiersAction
- Schemas: CreateInvoiceSchema
- Types: CreateInvoiceInput, PlanTier

## 4. State & Data Lifecycle
- Server Data: Handled via Server Actions and Server Repositories.
- Client UI State: Plan selection and invoice generation forms with client-side optimistic feedback.

## 5. Data Source Status
- [x] Mock data layer (default in-memory repositories)
- [ ] Real Neon Postgres via Prisma (only after user explicitly enables per Section 12)

## 6. Maintenance Log
- 2026-08-25: Initialized directory specification per Master System Instructions.
