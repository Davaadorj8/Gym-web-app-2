# Directory Specification: lib

## 1. Architectural Alignment
- Layer Level: Shared Utilities & Domain Services (Cross-cutting layer)
- Zachman Framework Cell: Builder (Technology Physics) / What & How
- Domain Scope: Provides pure utilities, internationalization dictionaries, domain calculation services, repositories, and context orchestration for Arche Gym Ironpulse.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- External standard libraries (clsx, tailwind-merge, date-fns, lucide-react)

**Forbidden Imports:**
- Direct UI component dependencies inside pure utility functions

## 3. Public API Exports
- Utilities: `cn`, `formatCurrency`, `CURRENCY_SYMBOL`, `CURRENCY_CODE`
- Services: `analytics.service`, `member.service`, `plan.service`
- Repositories: `member.repository`, `plan.repository`, `checkin.repository`
- Translations & Messages: `messages.ts`
- Orchestration: `DashboardContext.tsx`
- Security: `password.ts` (bcryptjs password hashing & validation)
- Constants: `permissions.ts` (strongly typed RBAC permission enum and role map)

## 4. State & Data Lifecycle
- Server Data / Persistence: Mock repository store with localStorage synchronization and initial seed data in Mongolian Tugrik (MNT).
- Client State: React Context (`DashboardContext`) providing typed state management across components.

## 5. Data Source Status
- [x] Mock data layer (default)
- [ ] Real Neon Postgres via Prisma (only after user explicitly enables per Section 12)

## 6. Maintenance Log
- 2026-08-26: Updated pricing calculations and formatting to Mongolian Tugrik (₮ MNT), updated test suites to node environment, verified all unit tests passing.
- 2026-08-27: Added translation keys for Traffic Analysis and Locker Status Overview to `messages.ts` for both English and Mongolian locales.
- 2026-08-28: Implemented Phase 1 Security, Logic Consolidation & Data Governance including async password hashing via bcryptjs, strongly typed Permission Enums, and NextAuth credentials validation.
