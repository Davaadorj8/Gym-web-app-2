# Directory Specification: lib/repositories/in-memory

## 1. Architectural Alignment
- Layer Level: Persistence - In-Memory Repository Implementation
- Zachman Framework Cell: Operations / How
- Domain Scope: In-memory mock repositories conforming to repository contracts with localStorage backup.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- `@/lib/repositories/types`
- `@/lib/types`

## 3. Public API Exports
- `inMemoryMemberRepository`, `inMemoryPlanRepository`, `inMemoryCheckInRepository`

## 4. Maintenance Log
- 2026-08-28: Initialized in-memory repository specification.
