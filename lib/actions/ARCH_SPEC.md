# Directory Specification: lib/actions

## 1. Architectural Alignment
- Layer Level: Server Action Utilities
- Zachman Framework Cell: Builder / How
- Domain Scope: Provides `safeAction` wrapper for type-safe Server Actions and Zod validation error handling.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- `zod`

## 3. Public API Exports
- `createSafeAction`: Wrapper for server action validation and execution.

## 4. Maintenance Log
- 2026-08-28: Initialized safeAction specification.
