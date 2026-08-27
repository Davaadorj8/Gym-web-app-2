# Directory Specification: features/members/types

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature / Data)
- Zachman Framework Cell: What (Data & State) / Owner (Business Concept)
- Domain Scope: Type definitions and validation schemas for gym members.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- zod (Validation Library)
- @/lib/types (Global Types)

## 3. Public API Exports (index.ts)
- CanonicalMemberSchema
- CreateMemberSchema
- MemberStatusSchema
- OccupancyStatusSchema
- CategoryTargetSchema
- CreateMemberInput
- CanonicalMember
- MemberRecord
