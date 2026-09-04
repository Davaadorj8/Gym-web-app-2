# Directory Specification: lib/security

## 1. Architectural Alignment
- Layer Level: Shared Infrastructure & Security
- Zachman Framework Cell: Builder (Technology Physics) / Who & How
- Domain Scope: Provides secure password hashing, verification, and authentication security functions.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- `bcryptjs`

**Forbidden Imports:**
- `@/components/*`
- `@/app/*`

## 3. Public API Exports
- Functions: `hashPassword`, `verifyPassword`

## 4. State & Data Lifecycle
- Stateless security utilities.

## 5. Data Source Status
- [x] Mock data layer / In-Memory
- [ ] Real Neon Postgres via Prisma

## 6. Maintenance Log
- 2026-08-28: Initialized password security specification.
