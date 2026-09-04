# Directory Specification: features/registration/actions

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature Server Actions)
- Domain Scope: Server actions for member and organization registration.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- `@/lib/schemas/registration`
- `@/lib/repositories`
- `@/lib/types`

## 3. Public API Exports (index.ts)
- `registerMemberAction`
- `registerOrganizationAction`

## 4. Maintenance Log
- [2026-09-04]: Created specification.
