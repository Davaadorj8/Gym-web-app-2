# Directory Specification: src/features/inventory/actions

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature / Logic)
- Zachman Framework Cell: How (Logic & Process) / Owner (Business Concept)
- Domain Scope: Server-side mutations and reads for nutrient products/sales, suppliers,
  purchase orders, and stock intake.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- ../types (Local Feature Types)
- @/server/actions/safeAction (Action Wrapper)
- @/server/repositories (Server Data Access)
- @/lib/services/inventory.service (pure calculations: PO totals, margin, stock thresholds)
- zod (Validation)

## 3. Public API Exports (index.ts)
- `nutrients.ts`: addNutrientAction, updateNutrientAction, deleteNutrientAction,
  updateNutrientPriceAction, recordNutrientSaleAction, getNutrientsAction,
  getNutrientSalesAction
- `suppliers.ts`: addSupplierAction, updateSupplierAction, deleteSupplierAction,
  getSuppliersAction
- `purchaseOrders.ts`: createPurchaseOrderAction, receivePurchaseOrderAction,
  cancelPurchaseOrderAction, getPurchaseOrdersAction, getStockIntakesAction

## 4. State & Data Lifecycle
- Every action requires `tenantId` and passes it straight to the relevant repository.
- `recordNutrientSaleAction` writes the sale row **and** decrements the matching nutrient's
  stock via `INutrientRepository.adjustStock` in one action — the two are one logical
  operation (a sale that doesn't move stock is a bug), so they're not split across features
  or left to the caller to sequence.
- `receivePurchaseOrderAction` is the same pattern at larger scale: it marks the PO
  RECEIVED, then for each line item looks up the nutrient's current price, computes the
  margin, calls `adjustStock` (+quantity), and writes a `StockIntakeLog` row — all as
  sequential `await`s inside one action, so the whole cascade either fully applies or fails
  before any of it is treated as done by the caller.
- Actions omit a `revalidateTarget` (matching the lockers/checkins precedent) — these are
  fired from `DashboardContext` as background persistence alongside an optimistic local
  update, and a `revalidatePath` call needs a live Next.js request context that a plain
  Vitest unit test doesn't have.
