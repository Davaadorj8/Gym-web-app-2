# Directory Specification: src/features/inventory/types

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature / Data)
- Zachman Framework Cell: What (Data & State) / Owner (Business Concept)
- Domain Scope: Type definitions and validation schemas for nutrient products/sales (this
  commit) and suppliers/purchase-orders/stock-intake (follow-up commit).

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- zod (Validation Library)
- @/lib/types (Global Types)

## 3. Public API Exports (index.ts)
- NutrientCategorySchema, AddNutrientSchema, UpdateNutrientSchema, DeleteNutrientSchema,
  UpdateNutrientPriceSchema, RecordNutrientSaleSchema
- AddNutrientInput, UpdateNutrientInput, DeleteNutrientInput, UpdateNutrientPriceInput,
  RecordNutrientSaleInput
- NutrientProduct, NutrientSaleLog (re-exported from @/lib/types)
