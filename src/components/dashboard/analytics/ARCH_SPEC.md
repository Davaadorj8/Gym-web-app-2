# Directory Specification: src/components/dashboard/analytics

## 1. Architectural Alignment
- Layer Level: Level 2/3 (Dashboard Analytics Tab Views)
- Domain Scope: Financial, operational, plan, nutrient, locker, and member analytics.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- `@/components/ui/*`
- `@/lib/*`
- `recharts`

## 3. Public API Exports (index.ts)
- `FinancialTab`
- `OperationalTab`
- `PlansTab`
- `NutrientsTab`
- `LockersTab`
- `MembersTab`

## 4. Maintenance Log
- [2026-09-04]: Created specification.
