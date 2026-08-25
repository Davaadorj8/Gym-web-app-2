# Directory Specification: components/auth

## 1. Architectural Alignment
- Layer Level: Level 2 (Shared Application Primitives)
- Zachman Framework Cell: Subcontractor (Assembly) / Who
- Domain Scope: Authentication presentation screen and wrapper components.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/components/ui/* (Level 1 Primitives)
- @/lib/* (Shared Utilities)
- @/features/auth (Auth public barrel)

**Forbidden Imports:**
- Deep imports into other feature internals
- Direct database instances

## 3. Public API Exports
- LoginScreen

## 4. State & Data Lifecycle
- Login submission handled through @/features/auth actions with loading and error states.

## 5. Data Source Status
- Mock data layer / Auth.js credentials provider

## 6. Maintenance Log
- 2026-08-25: Initialized directory specification per Master System Instructions.
