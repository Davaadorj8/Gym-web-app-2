# Directory Specification: src/features/auth

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature)
- Zachman Framework Cell: Who (Identity & Access) / Owner (Business Concept)
- Domain Scope: Manages authentication flows, credential verification, Zod validation contracts, session callbacks, and auth UI state.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/components/ui/* (Level 1 Primitives)
- @/components/* (Level 2 Shared Application Primitives)
- @/lib/* (Shared Utilities)
- @/lib/store/* (Typed Redux State)
- @/server/actions/* (Safe action wrappers)

**Forbidden Imports:**
- Internal files of OTHER features (e.g., features/members/actions/*)
- Direct database instances (prisma or mock client) inside client components

## 3. Public API Exports (index.ts)
Only items listed below are exported for external consumption:
- Components: LoginForm
- Actions: loginAction, logoutAction, loginWithGitHub
- Schemas: LoginCredentialsSchema, LoginSchema
- Types: LoginCredentialsInput, LoginInput, AuthSessionUser

## 4. State & Data Lifecycle
- Server Data: Handled via NextAuth / Auth.js `authorize()`, JWT/session callbacks, and server actions.
- Client UI State: Session state managed via `SessionProvider` and `useSession()`. Credential input validated via Zod schema.

## 5. Data Source Status
- [x] Mock data layer (default in-memory credentials & Auth.js handlers)
- [ ] Real Neon Postgres via Prisma (only after user explicitly enables per Section 12)

## 6. Maintenance Log
- 2026-08-25: Initialized directory specification per Master System Instructions.
- 2026-08-27: Implemented "Clean Dev Mock Approach" for authentication; configured `authorize` bypass in `auth.config.ts`.
- 2026-09-04: Upgraded authentication to full NextAuth integration with SessionProvider, Zod LoginCredentialsSchema validation, typed NextAuth callbacks, and consolidated LoginForm.
- 2026-09-04: Added direct dev-login route (`/api/auth/dev-login`) that manually issues Auth.js JWT session tokens to prevent iframe CSRF cookie partitioning in sandboxed preview environments.
- 2026-09-04: Fixed Auth.js "Failed to fetch" error: properly wrapped GitHub provider factory invocation in `auth.config.ts` conditional on available credentials, and added graceful fallback handling to `loginWithGitHub` action.
