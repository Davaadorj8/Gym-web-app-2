# Directory Specification: lib/constants

## 1. Architectural Alignment
- Layer Level: Shared Constants
- Zachman Framework Cell: Subcontractor / What
- Domain Scope: Defines domain permissions, pricing tiers, and system constants.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- Pure TypeScript constants only.

**Forbidden Imports:**
- React components or dynamic logic.

## 3. Public API Exports
- Permissions: `Permission`, `ROLE_PERMISSIONS`
- Pricing: Pricing constants and plan defaults.

## 4. State & Data Lifecycle
- Immutable constants.

## 5. Data Source Status
- [x] N/A (Static Constants)

## 6. Maintenance Log
- 2026-08-28: Initialized constants directory specification.
