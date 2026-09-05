# Directory Specification: src/features/inventory

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature)
- Zachman Framework Cell: Owner (Business Concept) / What
- Domain Scope: Nutrient/product catalog and POS sales, plus suppliers, purchase orders,
  and stock intake. One feature module covers all five entities deliberately: receiving a
  purchase order must atomically bump matching nutrient stock and write a stock-intake log,
  so keeping that cascade internal to one feature avoids a cross-feature call for what is
  really one business operation.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/components/ui/* (Level 1 Primitives)
- @/components/* (Level 2 Shared Application Primitives)
- @/lib/* (Shared Utilities)
- @/server/actions/* (Safe action wrappers)
- @/server/repositories/in-memory/base, @/server/repositories/types (generic
  `InMemoryRepository<T>` base class and `CrudRepository`/`TenantQueryContext` contracts
  only — this domain's own repository implementation lives in this feature, see below)

**Forbidden Imports:**
- Internal files of OTHER features
- Direct database instances (prisma or mock client) inside client components

## 3. Public API Exports (index.ts)
- Nutrient actions: addNutrientAction, updateNutrientAction, deleteNutrientAction,
  updateNutrientPriceAction, recordNutrientSaleAction, getNutrientsAction,
  getNutrientSalesAction
- Nutrient schemas/types: NutrientCategorySchema, AddNutrientSchema, UpdateNutrientSchema,
  DeleteNutrientSchema, UpdateNutrientPriceSchema, RecordNutrientSaleSchema,
  AddNutrientInput, UpdateNutrientInput, DeleteNutrientInput, UpdateNutrientPriceInput,
  RecordNutrientSaleInput, NutrientProduct, NutrientSaleLog
- Supplier actions: addSupplierAction, updateSupplierAction, deleteSupplierAction,
  getSuppliersAction
- Purchase order actions: createPurchaseOrderAction, receivePurchaseOrderAction,
  cancelPurchaseOrderAction, getPurchaseOrdersAction, getStockIntakesAction
- Supplier/PO schemas/types: AddSupplierSchema, UpdateSupplierSchema, DeleteSupplierSchema,
  POItemInputSchema, CreatePurchaseOrderSchema, ReceivePurchaseOrderSchema,
  CancelPurchaseOrderSchema, AddSupplierInput, UpdateSupplierInput, DeleteSupplierInput,
  CreatePurchaseOrderInput, ReceivePurchaseOrderInput, CancelPurchaseOrderInput, Supplier,
  PurchaseOrder, StockIntakeLog, POItem — all five entities are this domain's OWN types
  (`types/index.ts`), not re-exports from `@/lib/types` as of the Phase B
  domain-isolation pass (2026-09-05)
- Repository: INutrientRepository, INutrientSaleRepository, ISupplierRepository,
  IPurchaseOrderRepository, IStockIntakeRepository, InMemoryNutrientRepository,
  InMemoryNutrientSaleRepository, InMemorySupplierRepository,
  InMemoryPurchaseOrderRepository, InMemoryStockIntakeRepository,
  getNutrientRepository, getNutrientSaleRepository, getSupplierRepository,
  getPurchaseOrderRepository, getStockIntakeRepository (`repository.ts` — all five kept
  in one module, consistent with the PO-receipt atomic-cascade rationale in Section 1)
- Service: getNutrientExpiryStatus, calculatePOTotal, calculateMarginPercent,
  isLowStock, isOutOfStock, LOW_STOCK_THRESHOLD, ExpiryStatus (`service.ts` — pure
  calculation helpers, moved from `@/lib/services/inventory.service.ts`)

## 4. State & Data Lifecycle
- Server Data: Handled via Server Actions and repository access. Every write action
  requires `tenantId` — closing a gap the source types had (`tenantId`/`locationId` were
  optional on every one of these five entities and never actually stamped on new records
  before this extraction).
- Client Bridge: `src/lib/orchestration/DashboardContext.tsx` calls these actions from its
  nutrient-domain methods alongside their existing optimistic local state updates, and
  fetches initial state via `getNutrientsAction`/`getNutrientSalesAction` on mount, so
  existing `useDashboard()` consumers (`InventoryView`, `InventoryTable`, `AnalyticsView`,
  `NutrientsTab`) needed no changes.

## 5. Data Source Status
- [x] Mock data layer (default in-memory repositories)
- [ ] Real Neon Postgres via Prisma (only after user explicitly enables per Section 12)

## 6. Maintenance Log
- 2026-09-04: Initialized as Phase B, Domain 3 of the DashboardContext extraction roadmap
  (commit 1: nutrients/sales half of the domain, landed first since the PO-receive cascade
  needs the nutrient repository's `adjustStock` to already exist). Unlike check-ins, every
  one of these callbacks had real, live `useDashboard()` callers already — this was a pure
  localStorage-to-repository migration, not a dead-code discovery.
- 2026-09-04: Commit 2 added suppliers, purchase orders, and stock intake, completing the
  domain. Fixed a real double-invoke hazard along the way: the old `receivePurchaseOrder`
  mutated an array from inside a nested React state-updater callback; the new
  `receivePurchaseOrderAction` does the same work (mark PO received, then for each item bump
  nutrient stock and write a stock-intake log with a computed margin) as plain sequential
  `await`s in one server action instead.
- 2026-09-05: Backend domain-isolation pass. This feature now owns its full stack:
  entity types (`types/index.ts`, moved from `@/lib/types/inventory.types.ts`),
  repository (`repository.ts`, moved from `@/server/repositories`, all five entities kept
  together), and pure calculation helpers (`service.ts`, moved from
  `@/lib/services/inventory.service.ts`) — previously this directory only owned Zod input
  schemas and re-exported entity types/repository access/calculations from shared modules
  every other domain also reached into. `DashboardContext.tsx` and the dashboard
  components that render inventory data (`InventoryView`, `InventoryTable`,
  `NutrientModal`, `NutrientSaleModal`, `PurchaseOrderModal`, `SuppliersAndPOTab`, and the
  analytics `NutrientsTab`) now import these types/helpers from `@/features/inventory`
  instead of `@/lib/types`/`@/lib/services`.
