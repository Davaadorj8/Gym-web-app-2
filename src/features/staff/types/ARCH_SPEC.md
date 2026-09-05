# Directory Specification: src/features/staff/types

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature / Data)
- Zachman Framework Cell: What (Data & State) / Owner (Business Concept)
- Domain Scope: Type definitions and validation schemas for staff accounts and shift
  attendance.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- zod (Validation Library)
- @/lib/types (Global Types)

## 3. Public API Exports (index.ts)
- StaffRoleSchema, StaffStatusSchema, RegisterStaffSchema, UpdateStaffSchema,
  DeleteStaffSchema, ResetStaffPasswordSchema, ClockInSchema, ClockOutSchema
- RegisterStaffInput, UpdateStaffInput, DeleteStaffInput, ResetStaffPasswordInput,
  ClockInInput, ClockOutInput
- StaffAccount, StaffAttendance (re-exported from @/lib/types)

## 4. Notes
- `RegisterStaffSchema` takes a plaintext `password` (min 4 chars, matching the existing
  client-side validation in `StaffRegistrationForm.tsx`) and a `registeredBy` string (the
  acting admin's display name) — the action layer hashes the password and stamps
  `registeredAt` itself; neither is ever passed in pre-computed.
- `UpdateStaffSchema` intentionally excludes `username` and `passwordHash` — renaming a
  username or changing a password go through dedicated flows (`resetStaffPasswordAction`
  for the latter; no rename flow exists in the UI today), not the general-purpose update.
