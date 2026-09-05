# Directory Specification: src/lib/utils

## 1. Architectural Alignment
- Layer Level: Shared Utilities
- Zachman Framework Cell: Builder / How
- Domain Scope: Helper utilities for class names, audit logs, and formatting.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- `clsx`, `tailwind-merge`

**Forbidden Imports:**
- UI views, business components.

## 3. Public API Exports
- `cn`: Tailwind class merge helper.
- `audit`: Audit logging helper functions.

## 4. State & Data Lifecycle
- Pure utility functions.

## 5. Data Source Status
- [x] N/A (Utility Helpers)

## 6. Maintenance Log
- 2026-08-28: Initialized utils specification.
