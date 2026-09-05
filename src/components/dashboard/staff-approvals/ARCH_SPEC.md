# Directory Specification: src/components/dashboard/staff-approvals

## 1. Architectural Alignment
- Layer Level: Level 2/3 (Dashboard Staff & Approvals Tab Views)
- Domain Scope: Staff directory table, staff registration form, approval requests, and password reset modal.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- `@/components/ui/*`
- `@/lib/*`
- `@/features/staff` (StaffAccount — entity type, not actions)

## 3. Public API Exports (index.ts)
- `StaffDirectoryTable`
- `StaffRegistrationForm`
- `ApprovalRequestsTab`
- `PasswordResetModal`

## 4. Maintenance Log
- [2026-09-04]: Created specification.
- [2026-09-05]: Backend domain-isolation pass — every component here (plus the parent
  `StaffApprovalsView`) now imports `StaffAccount` from `@/features/staff` instead of
  `@/lib/types`. `PasswordResetModal`/`StaffRegistrationForm`'s pre-existing eslint
  override (client-side password hashing, tracked separately in `eslint.config.mjs`) is
  unaffected by this change.
