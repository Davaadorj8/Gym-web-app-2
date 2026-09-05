# Directory Specification: src/features/staff/types

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature / Data)
- Zachman Framework Cell: What (Data & State) / Owner (Business Concept)
- Domain Scope: Type definitions and validation schemas for staff accounts and shift
  attendance.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- zod (Validation Library)

## 3. Public API Exports (index.ts)
- StaffRoleSchema, StaffStatusSchema, RegisterStaffSchema, UpdateStaffSchema,
  DeleteStaffSchema, ResetStaffPasswordSchema, ClockInSchema, ClockOutSchema
- RegisterStaffInput, UpdateStaffInput, DeleteStaffInput, ResetStaffPasswordInput,
  ClockInInput, ClockOutInput
- StaffAccount, StaffAttendance, STAFF_PERMISSION_OPTIONS, MOCK_STAFF_ACCOUNTS — owned
  entity types (not re-exported from `@/lib/types` as of the Phase B domain-isolation
  pass, 2026-09-05)

## 4. Notes
- `RegisterStaffSchema` takes a plaintext `password` (min 4 chars, matching the existing
  client-side validation in `StaffRegistrationForm.tsx`) and a `registeredBy` string (the
  acting admin's display name) — the action layer hashes the password and stamps
  `registeredAt` itself; neither is ever passed in pre-computed.
- `UpdateStaffSchema` intentionally excludes `username` and `passwordHash` — renaming a
  username or changing a password go through dedicated flows (`resetStaffPasswordAction`
  for the latter; no rename flow exists in the UI today), not the general-purpose update.

## 5. Maintenance Log
- 2026-09-05: Backend domain-isolation pass. Moved `StaffAccount`, `StaffAttendance`,
  `STAFF_PERMISSION_OPTIONS`, and `MOCK_STAFF_ACCOUNTS` here from
  `@/lib/types/staff.types.ts` (deleted). `UserRole`/`AuthUser`, which used to live
  alongside these in `staff.types.ts`, moved to the new
  `@/lib/types/identity.types.ts` instead — they're core identity concepts other domains
  reference too, not staff-specific.
