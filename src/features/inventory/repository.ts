import { InMemoryRepository } from '@/server/repositories/in-memory/base';
import { CrudRepository, TenantQueryContext } from '@/server/repositories/types';
import {
  NutrientProduct,
  NutrientSaleLog,
  Supplier,
  PurchaseOrder,
  StockIntakeLog,
  MOCK_NUTRIENT_PRODUCTS,
  MOCK_NUTRIENT_SALES,
  MOCK_SUPPLIERS,
  MOCK_PURCHASE_ORDERS,
  MOCK_STOCK_INTAKES,
} from './types';

// All 5 entities share one repository module (rather than one file per entity) because
// receiving a purchase order is one atomic business transaction that touches the
// purchase-order, nutrient stock, and stock-intake-log data together — splitting them
// into separate feature modules would force that single operation across a domain
// boundary for no isolation benefit, since nothing outside inventory needs to reach
// any of these five individually.

export interface INutrientRepository extends CrudRepository<NutrientProduct, string> {
  adjustStock(ctx: TenantQueryContext, productId: string, delta: number): Promise<NutrientProduct | null>;
}

export type INutrientSaleRepository = CrudRepository<NutrientSaleLog, string>;

export type ISupplierRepository = CrudRepository<Supplier, string>;

export interface IPurchaseOrderRepository extends CrudRepository<PurchaseOrder, string> {
  markReceived(ctx: TenantQueryContext, poId: string): Promise<PurchaseOrder | null>;
  markCancelled(ctx: TenantQueryContext, poId: string): Promise<PurchaseOrder | null>;
}

export type IStockIntakeRepository = CrudRepository<StockIntakeLog, string>;

export class InMemoryNutrientRepository
  extends InMemoryRepository<NutrientProduct>
  implements INutrientRepository
{
  constructor() {
    super(MOCK_NUTRIENT_PRODUCTS);
  }

  async adjustStock(ctx: TenantQueryContext, productId: string, delta: number): Promise<NutrientProduct | null> {
    const existing = this.items.get(productId);
    if (!existing || existing.deletedAt || !this.matchesTenant(existing, ctx)) return null;
    const updated = { ...existing, stock: Math.max(0, existing.stock + delta) };
    this.items.set(productId, updated);
    return { ...updated };
  }
}

export class InMemoryNutrientSaleRepository
  extends InMemoryRepository<NutrientSaleLog>
  implements INutrientSaleRepository
{
  constructor() {
    super(MOCK_NUTRIENT_SALES);
  }
}

export class InMemorySupplierRepository
  extends InMemoryRepository<Supplier>
  implements ISupplierRepository
{
  constructor() {
    super(MOCK_SUPPLIERS);
  }
}

export class InMemoryPurchaseOrderRepository
  extends InMemoryRepository<PurchaseOrder>
  implements IPurchaseOrderRepository
{
  constructor() {
    super(MOCK_PURCHASE_ORDERS);
  }

  async markReceived(ctx: TenantQueryContext, poId: string): Promise<PurchaseOrder | null> {
    const existing = this.items.get(poId);
    if (!existing || !this.matchesTenant(existing, ctx)) return null;
    const updated: PurchaseOrder = {
      ...existing,
      status: 'RECEIVED',
      receivedAt: new Date().toISOString(),
    };
    this.items.set(poId, updated);
    return { ...updated };
  }

  async markCancelled(ctx: TenantQueryContext, poId: string): Promise<PurchaseOrder | null> {
    const existing = this.items.get(poId);
    if (!existing || !this.matchesTenant(existing, ctx)) return null;
    const updated: PurchaseOrder = { ...existing, status: 'CANCELLED' };
    this.items.set(poId, updated);
    return { ...updated };
  }
}

export class InMemoryStockIntakeRepository
  extends InMemoryRepository<StockIntakeLog>
  implements IStockIntakeRepository
{
  constructor() {
    super(MOCK_STOCK_INTAKES);
  }
}

const nutrientRepository = new InMemoryNutrientRepository();
const nutrientSaleRepository = new InMemoryNutrientSaleRepository();
const supplierRepository = new InMemorySupplierRepository();
const purchaseOrderRepository = new InMemoryPurchaseOrderRepository();
const stockIntakeRepository = new InMemoryStockIntakeRepository();

export const getNutrientRepository = () => nutrientRepository;
export const getNutrientSaleRepository = () => nutrientSaleRepository;
export const getSupplierRepository = () => supplierRepository;
export const getPurchaseOrderRepository = () => purchaseOrderRepository;
export const getStockIntakeRepository = () => stockIntakeRepository;
