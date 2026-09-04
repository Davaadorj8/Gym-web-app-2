# Directory Specification: components/auth

## 1. Architectural Alignment
- Layer Level: Level 2 (Shared Application Primitives)
- Zachman Framework Cell: Subcontractor (Assembly) / Who
- Domain Scope: Legacy authentication presentation components. Primary auth form consolidated in `features/auth/components/LoginForm`.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/components/ui/* (Level 1 Primitives)
- @/lib/* (Shared Utilities)
- @/features/auth (Auth public barrel)

**Forbidden Imports:**
- Deep imports into other feature internals
- Direct database instances

## 3. Public API Exports
- (Consolidated into @/features/auth)

## 4. State & Data Lifecycle
- Authentication managed through NextAuth / Auth.js `useSession()`, `signIn()`, and `signOut()`.

## 5. Data Source Status
- Mock data layer / NextAuth credentials provider

## 6. Maintenance Log
- 2026-08-25: Initialized directory specification per Master System Instructions.
- 2026-09-04: Retired LoginScreen presentation component in favor of consolidated `features/auth/components/LoginForm` with NextAuth integration.
