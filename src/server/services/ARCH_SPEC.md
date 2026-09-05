# Directory Specification: src/server/services

## 1. Architectural Alignment
- Layer Level: Level 4 (Server Infrastructure — persistence-orchestrating domain services)
- Zachman Framework Cell: Builder (Technology Physics) / How
- Domain Scope: Domain services that orchestrate repository reads/writes as part of a
  business operation (membership status evaluation, refund processing). Distinct from
  `@/lib/services`, which holds pure, stateless calculation helpers with no repository
  access — see that directory's own ARCH_SPEC.md for the split rationale.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/server/repositories (Repository factories and types)
- @/lib/types (Domain entities)
- external libraries (date-fns, etc.)

**Forbidden Imports:**
- UI components
- Next.js Route Handlers or Server Actions calling this directly without going through a
  feature's own actions layer

## 3. Public API Exports (index.ts)
- `MembershipStatusService` (`getExpiringMembers`, `getExpiredMembers`,
  `evaluateMembershipStatuses`)
- `RefundService` (`cancelAndRefund`), `calculateProratedRefund`

## 4. State & Data Lifecycle
- Stateless service classes/functions that read and write through repository factories
  (`getMemberRepository`, `getMembershipTransactionRepository`) — not pure calculators.

## 5. Data Source Status
- [x] Mock data layer (default, via `@/server/repositories`)
- [ ] Real Neon Postgres via Prisma (only after user explicitly enables per ARCH_SPEC Section 12)

## 6. Maintenance Log
- 2026-08-27: Initialized directory specification (as lib/services).
- 2026-09-04: Split during the src/ migration — moved to server/services and narrowed to
  only the two repository-touching services (`MembershipStatusService`, `RefundService`).
  The six pure calculation services (member, locker, plan, analytics, staff, pricing) moved
  to `@/lib/services` instead, since they have no repository dependency and are legitimately
  importable from UI components under the layering rules.
