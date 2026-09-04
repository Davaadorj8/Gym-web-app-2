# Directory Specification: src/features/inventory

## 1. Architectural Alignment
- Layer Level: Level 3 (Business Feature)
- Zachman Framework Cell: Owner (Business Concept) / What
- Domain Scope: Nutrient/product catalog and POS sales, plus suppliers, purchase orders,
  and stock intake (added in a follow-up commit — see Maintenance Log). One feature module
  covers all five entities deliberately: receiving a purchase order must atomically bump
  matching nutrient stock and write a stock-intake log, so keeping that cascade internal to
  one feature avoids a cross-feature call for what is really one business operation.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/components/ui/* (Level 1 Primitives)
- @/components/* (Level 2 Shared Application Primitives)
- @/lib/* (Shared Utilities, incl. `@/lib/services/inventory.service`)
- @/server/actions/* (Safe action wrappers)
- @/server/repositories/* (Server repository interface)

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
- (Suppliers/PO/stock-intake actions and types land in a follow-up commit)

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
  (nutrients/sales half of the domain — suppliers/purchase-orders/stock-intake follow in
  a second commit against this same module, since the PO-receive cascade needs the
  nutrient repository's `adjustStock` to already exist). Unlike check-ins, every one of
  these callbacks had real, live `useDashboard()` callers already — this was a pure
  localStorage-to-repository migration, not a dead-code discovery. Fixed a real
  double-invoke hazard along the way: the old `receivePurchaseOrder` mutated an array from
  inside a nested React state-updater callback; the new server action does the same work as
  plain sequential `await`s instead.
