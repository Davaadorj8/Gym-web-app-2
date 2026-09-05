# Directory Specification: src/components/dashboard/inventory

## 1. Architectural Alignment
- Layer Level: Level 2/3 (Dashboard Inventory Tab Views)
- Domain Scope: Inventory, membership plan builder, nutrients, and supplier modals.

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- `@/components/ui/*`
- `@/lib/*`
- `@/features/inventory` (NutrientProduct, Supplier, PurchaseOrder, getNutrientExpiryStatus — entity types/pure helpers, not actions)
- `@/features/lockers` (LockerCustomStatus — LockerManagementTab/LockerStatusUpdateForm render locker status)

## 3. Public API Exports (index.ts)
- `InventoryTable`
- `InventoryFilters`
- `LockerManagementTab`
- `MembershipPlanBuilderTab`
- `SuppliersAndPOTab`

## 4. Maintenance Log
- [2026-09-04]: Created specification.
- [2026-09-05]: Backend domain-isolation pass — `InventoryTable`, `NutrientModal`,
  `NutrientSaleModal`, `PurchaseOrderModal`, `SuppliersAndPOTab` now import
  `NutrientProduct`/`Supplier`/`PurchaseOrder`/`getNutrientExpiryStatus` from
  `@/features/inventory` instead of `@/lib/types`/`@/lib/services`;
  `LockerManagementTab`/`LockerStatusUpdateForm` import `LockerCustomStatus` from
  `@/features/lockers` instead of `@/lib/types`.
