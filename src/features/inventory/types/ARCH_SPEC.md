# Directory Specification: src/features/inventory/types

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature / Data)
- Zachman Framework Cell: What (Data & State) / Owner (Business Concept)
- Domain Scope: Type definitions and validation schemas for nutrient products/sales,
  suppliers, purchase orders, and stock intake.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- zod (Validation Library)

## 3. Public API Exports (index.ts)
- NutrientCategorySchema, AddNutrientSchema, UpdateNutrientSchema, DeleteNutrientSchema,
  UpdateNutrientPriceSchema, RecordNutrientSaleSchema
- AddNutrientInput, UpdateNutrientInput, DeleteNutrientInput, UpdateNutrientPriceInput,
  RecordNutrientSaleInput
- AddSupplierSchema, UpdateSupplierSchema, DeleteSupplierSchema, POItemInputSchema,
  CreatePurchaseOrderSchema, ReceivePurchaseOrderSchema, CancelPurchaseOrderSchema
- AddSupplierInput, UpdateSupplierInput, DeleteSupplierInput, CreatePurchaseOrderInput,
  ReceivePurchaseOrderInput, CancelPurchaseOrderInput
- NutrientProduct, NutrientSaleLog, Supplier, PurchaseOrder, POItem, StockIntakeLog —
  owned entity types (not re-exported from `@/lib/types` as of the Phase B
  domain-isolation pass, 2026-09-05)

## 4. Maintenance Log
- 2026-09-05: Backend domain-isolation pass. Moved `NutrientProduct`, `NutrientCategory`,
  `NutrientSaleLog`, `Supplier`, `POItem`, `PurchaseOrder`, `StockIntakeLog`, and their
  mock seed data here from `@/lib/types/inventory.types.ts` (deleted).
