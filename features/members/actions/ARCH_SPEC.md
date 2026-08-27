# Directory Specification: features/members/actions

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature / Logic)
- Zachman Framework Cell: How (Logic & Process) / Owner (Business Concept)
- Domain Scope: Server-side business logic and mutations for gym members.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- ../types (Local Feature Types)
- @/lib/actions/safeAction (Action Wrapper)
- @/lib/repositories (Server Data Access)
- date-fns (Date Utilities)

## 3. Public API Exports (index.ts)
- registerMemberAction

## 4. State & Data Lifecycle
- Performs data validation via Zod and writes to the repository layer.
