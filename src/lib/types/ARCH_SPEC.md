# Directory Specification: src/lib/types

## 1. Architectural Alignment
- Layer Level: Domain Models & TypeScript Interfaces
- Zachman Framework Cell: Subcontractor / What
- Domain Scope: Core, genuinely cross-cutting reference types shared by multiple domains
  (identity/who-acted, tenant/location reference data) plus the members domain's entity
  types (members hasn't been extracted into its own feature module yet — see
  `src/features/members/ARCH_SPEC.md`). **Not** a shared kernel for every domain's
  entities: lockers, staff, and inventory each own their entity types under
  `src/features/<domain>/types/` as of the Phase B domain-isolation pass (2026-09-05) —
  do not add new domain-specific interfaces here.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- Pure TypeScript type declarations only.

## 3. Public API Exports
- `identity.types.ts`: `UserRole`, `AuthUser` — core identity concepts referenced by
  multiple domains (e.g. lockers logging who checked a member in) without depending on
  any one domain's internals.
- `tenancy.types.ts`: `GymLocation`, `MOCK_LOCATIONS` — multi-location reference data
  used by every domain's `tenantId`/`locationId` scoping.
- `members.types.ts`: `GymMember`, `BuiltPlan`, `MembershipExtensionLog`,
  `MembershipTransaction`, `CategoryTarget`, `MemberStatus`, `OccupancyStatus`,
  `TransactionType`, mock seed data. (Members/billing haven't been extracted into their
  own feature modules yet — Phase C, deferred.)

## 4. State & Data Lifecycle
- Static compile-time types.

## 5. Maintenance Log
- 2026-08-28: Initialized types specification.
- 2026-09-05: Phase B domain-isolation pass. Extracted `identity.types.ts` (`UserRole`,
  `AuthUser`, moved out of `staff.types.ts`) and `tenancy.types.ts` (`GymLocation`,
  `MOCK_LOCATIONS`, moved out of `members.types.ts`) as the two genuinely shared
  concepts. Deleted `lockers.types.ts`, `staff.types.ts`, and `inventory.types.ts`
  entirely — their contents moved into `src/features/{lockers,staff,inventory}/types/`,
  which now own their entity types instead of this directory defining them for every
  domain to re-export. This also removed a direct cross-domain dependency that lived
  inside this "shared kernel" itself: `lockers.types.ts` used to import `UserRole` from
  `staff.types.ts`; both now depend on the neutral `identity.types.ts` instead.
