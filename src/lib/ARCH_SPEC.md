# Directory Specification: src/lib

## 1. Architectural Alignment
- Layer Level: Shared Utilities & pure Domain-Calculation Services (Cross-cutting layer)
- Zachman Framework Cell: Builder (Technology Physics) / What & How
- Domain Scope: Provides pure utilities, internationalization dictionaries, pure domain
  calculation services, i18n messages, and client-side orchestration (DashboardContext)
  for Arche Gym Ironpulse. Does **not** contain repositories, persistence-orchestrating
  services, server actions, or security/DB code — those moved to `src/server/` as Level 4
  Server Infrastructure. See `src/server/ARCH_SPEC.md`-equivalents in each `src/server/*`
  subdirectory for that boundary.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- External standard libraries (clsx, tailwind-merge, date-fns, lucide-react)

**Forbidden Imports:**
- Direct UI component dependencies inside pure utility functions
- `@/server/*` — with the single tracked exception of `@/lib/orchestration`, see that
  directory's ARCH_SPEC.md

## 3. Public API Exports
- Utilities: `cn`, `formatCurrency`, `CURRENCY_SYMBOL`, `CURRENCY_CODE`
- Pure Services: `analytics.service`, `member.service`, `plan.service`, `locker.service`,
  `staff.service`, `pricing.service` (see `src/lib/services/ARCH_SPEC.md`)
- Translations & Messages: `messages/` (single canonical i18n source; the former parallel
  `translations/` directory was deleted as dead code — see Maintenance Log)
- Orchestration: `DashboardContext.tsx` (see `src/lib/orchestration/ARCH_SPEC.md` for its
  tracked exception to reach `src/server/*` directly)
- Constants: `permissions.ts` (strongly typed RBAC permission enum and role map)

## 4. State & Data Lifecycle
- No persistence of its own — pure calculation and formatting only.
- Client State: React Context (`DashboardContext`) providing typed state management across
  components; it is the one file in this directory that reaches into `src/server/*`.

## 5. Data Source Status
- [x] Mock data layer (default, reached only via `src/lib/orchestration` → `src/server/*`)
- [ ] Real Neon Postgres via Prisma (only after user explicitly enables per Section 12)

## 6. Maintenance Log
- 2026-08-26: Updated pricing calculations and formatting to Mongolian Tugrik (₮ MNT), updated test suites to node environment, verified all unit tests passing.
- 2026-08-27: Added translation keys for Traffic Analysis and Locker Status Overview to `messages.ts` for both English and Mongolian locales.
- 2026-08-28: Implemented Phase 1 Security, Logic Consolidation & Data Governance including async password hashing via bcryptjs, strongly typed Permission Enums, and NextAuth credentials validation.
- 2026-09-04: Foundation-phase architecture alignment — moved to `src/lib`; moved
  repositories, the two IO-touching services, actions/safeAction, security, db.ts and
  prisma.ts out to `src/server/*` (real Level 4 boundary, now enforced by
  `eslint-plugin-boundaries`); deleted the dead `translations/` directory and the
  `messages.ts`/`translations.ts` flat shim files in favor of `messages/` directly.
