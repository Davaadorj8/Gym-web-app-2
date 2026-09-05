# Directory Specification: src/features/billing/actions

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature Server Actions)
- Domain Scope: Billing and subscription management server actions.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- `@/lib/types`
- `@/server/repositories`

## 3. Public API Exports (index.ts)
- `processPaymentAction`
- `issueRefundAction`

## 4. Maintenance Log
- [2026-09-04]: Created specification.
