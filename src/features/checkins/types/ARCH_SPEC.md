# Directory Specification: src/features/checkins/types

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature / Data)
- Zachman Framework Cell: What (Data & State) / Owner (Business Concept)
- Domain Scope: Type definitions and validation schemas for check-in/check-out.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- zod (Validation Library)

## 3. Public API Exports (index.ts)
- CheckInMemberSchema, CheckOutMemberSchema
- CheckInMemberInput, CheckOutMemberInput
