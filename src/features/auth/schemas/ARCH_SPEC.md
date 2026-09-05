# Directory Specification: src/features/auth/schemas

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature Schemas)
- Zachman Framework Cell: Builder (Technology Physics) / What
- Domain Scope: Zod validation schemas for authentication inputs and credentials.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- zod

**Forbidden Imports:**
- Outer layers or components
- Database or UI instances

## 3. Public API Exports (index.ts)
- Schemas: LoginCredentialsSchema, LoginSchema
- Types: LoginCredentialsInput, LoginInput

## 4. State & Data Lifecycle
- Validates credential payloads before Server Action or authorize() execution.

## 5. Data Source Status
- [x] Mock data layer (default)
- [ ] Real Neon Postgres via Prisma

## 6. Maintenance Log
- 2026-09-04: Created schema specification and credentials validation contract.
