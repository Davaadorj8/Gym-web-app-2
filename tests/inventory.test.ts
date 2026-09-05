import { describe, it, expect, beforeEach } from 'vitest';
import {
  InMemoryNutrientRepository,
  InMemoryNutrientSaleRepository,
  InMemorySupplierRepository,
  InMemoryPurchaseOrderRepository,
  NutrientProduct,
  PurchaseOrder,
} from '@/features/inventory';
import {
  addNutrientAction,
  recordNutrientSaleAction,
  getNutrientsAction,
  getNutrientSalesAction,
  updateNutrientPriceAction,
  deleteNutrientAction,
  addSupplierAction,
  getSuppliersAction,
  createPurchaseOrderAction,
  receivePurchaseOrderAction,
  cancelPurchaseOrderAction,
  getPurchaseOrdersAction,
  getStockIntakesAction,
  getNutrientRepository,
  getSupplierRepository,
  calculateMarginPercent,
  calculatePOTotal,
  isLowStock,
  isOutOfStock,
} from '@/features/inventory';

function makeNutrient(id: string, stock = 10): NutrientProduct {
  return {
    id,
    name: 'Whey Protein',
    category: 'Supplements',
    price: 100000,
    stock,
  };
}

describe('INutrientRepository.adjustStock', () => {
  let repo: InMemoryNutrientRepository;
  const ctx = { tenantId: 'tenant-arche', locationId: 'loc-downtown' };

  beforeEach(() => {
    repo = new InMemoryNutrientRepository();
  });

  it('decrements stock and clamps at zero', async () => {
    await repo.create(ctx, makeNutrient('nutr-a', 5));
    const afterDecrement = await repo.adjustStock(ctx, 'nutr-a', -3);
    expect(afterDecrement?.stock).toBe(2);

    const clamped = await repo.adjustStock(ctx, 'nutr-a', -100);
    expect(clamped?.stock).toBe(0);
  });

  it('increments stock', async () => {
    await repo.create(ctx, makeNutrient('nutr-b', 5));
    const updated = await repo.adjustStock(ctx, 'nutr-b', 20);
    expect(updated?.stock).toBe(25);
  });

  it('returns null for a nutrient outside the tenant/location scope', async () => {
    await repo.create(ctx, makeNutrient('nutr-c', 5));
    const utCtx = { tenantId: 'tenant-arche', locationId: 'loc-uptown' };
    const result = await repo.adjustStock(utCtx, 'nutr-c', -1);
    expect(result).toBeNull();
  });
});

describe('inventory feature actions — nutrients', () => {
  const tenantId = 'tenant-arche';
  const locationId = 'loc-downtown';

  it('addNutrientAction validates and persists', async () => {
    const badResult = await addNutrientAction({ name: 'x' });
    expect(badResult.success).toBe(false);

    const result = await addNutrientAction({
      tenantId,
      locationId,
      name: 'Pre-Workout',
      category: 'Supplements',
      price: 55000,
      stock: 12,
    });
    expect(result.success).toBe(true);
    expect(result.data?.stock).toBe(12);

    const listResult = await getNutrientsAction({ tenantId, locationId });
    expect(listResult.success).toBe(true);
    expect(listResult.data?.some((n) => n.name === 'Pre-Workout')).toBe(true);
  });

  it('recordNutrientSaleAction creates a sale row and decrements stock in one action', async () => {
    await getNutrientRepository().create({ tenantId, locationId }, makeNutrient('sale-nutr-1', 20));

    const result = await recordNutrientSaleAction({
      tenantId,
      locationId,
      productId: 'sale-nutr-1',
      productName: 'Whey Protein',
      category: 'Supplements',
      quantity: 3,
      unitPrice: 100000,
      totalPrice: 300000,
      paymentMethod: 'Cash',
    });
    expect(result.success).toBe(true);

    const salesResult = await getNutrientSalesAction({ tenantId, locationId });
    expect(salesResult.success).toBe(true);
    expect(salesResult.data?.some((s) => s.productId === 'sale-nutr-1' && s.quantity === 3)).toBe(true);

    const nutrientsResult = await getNutrientsAction({ tenantId, locationId });
    const updated = nutrientsResult.data?.find((n) => n.id === 'sale-nutr-1');
    expect(updated?.stock).toBe(17);
  });

  it('updateNutrientPriceAction validates and clamps, deleteNutrientAction removes', async () => {
    await getNutrientRepository().create({ tenantId, locationId }, makeNutrient('price-nutr-1', 5));

    const priceResult = await updateNutrientPriceAction({
      tenantId,
      locationId,
      id: 'price-nutr-1',
      price: 200000,
    });
    expect(priceResult.success).toBe(true);
    expect(priceResult.data?.price).toBe(200000);

    const deleteResult = await deleteNutrientAction({ tenantId, locationId, id: 'price-nutr-1' });
    expect(deleteResult.success).toBe(true);

    const missingResult = await updateNutrientPriceAction({
      tenantId,
      locationId,
      id: 'no-such-nutrient',
      price: 1,
    });
    expect(missingResult.success).toBe(false);
  });
});

describe('IPurchaseOrderRepository.markReceived / markCancelled', () => {
  let repo: InMemoryPurchaseOrderRepository;
  const ctx = { tenantId: 'tenant-arche', locationId: 'loc-downtown' };

  function makePO(id: string): PurchaseOrder {
    return {
      id,
      supplierId: 'sup-1',
      supplierName: 'Iron Supply Co',
      status: 'ORDERED',
      items: [{ id: `${id}-item`, productId: 'nutr-x', productName: 'Whey', quantity: 5, unitPurchaseCost: 1000 }],
      totalCost: 5000,
      createdAt: new Date().toISOString(),
    };
  }

  beforeEach(() => {
    repo = new InMemoryPurchaseOrderRepository();
  });

  it('markReceived sets status and receivedAt', async () => {
    await repo.create(ctx, makePO('po-a'));
    const updated = await repo.markReceived(ctx, 'po-a');
    expect(updated?.status).toBe('RECEIVED');
    expect(updated?.receivedAt).toBeDefined();
  });

  it('markCancelled sets status to CANCELLED', async () => {
    await repo.create(ctx, makePO('po-b'));
    const updated = await repo.markCancelled(ctx, 'po-b');
    expect(updated?.status).toBe('CANCELLED');
  });

  it('returns null for a PO outside the tenant/location scope', async () => {
    await repo.create(ctx, makePO('po-c'));
    const utCtx = { tenantId: 'tenant-arche', locationId: 'loc-uptown' };
    expect(await repo.markReceived(utCtx, 'po-c')).toBeNull();
    expect(await repo.markCancelled(utCtx, 'po-c')).toBeNull();
  });
});

describe('inventory feature actions — suppliers', () => {
  const tenantId = 'tenant-arche';
  const locationId = 'loc-downtown';

  it('addSupplierAction validates and persists', async () => {
    const badResult = await addSupplierAction({ name: 'x' });
    expect(badResult.success).toBe(false);

    const result = await addSupplierAction({
      tenantId,
      locationId,
      name: 'Iron Supply Co',
      contactEmail: 'orders@ironsupply.test',
      phone: '555-0100',
      leadTimeDays: 3,
    });
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('Iron Supply Co');

    const listResult = await getSuppliersAction({ tenantId, locationId });
    expect(listResult.success).toBe(true);
    expect(listResult.data?.some((s) => s.name === 'Iron Supply Co')).toBe(true);
  });

  it('getSuppliersAction scopes results to tenant/location', async () => {
    await getSupplierRepository().create(
      { tenantId, locationId },
      { id: 'sup-scoped', name: 'Downtown Only', contactEmail: 'a@b.test', phone: '1', leadTimeDays: 1 }
    );

    const uptownResult = await getSuppliersAction({ tenantId, locationId: 'loc-uptown' });
    expect(uptownResult.data?.some((s) => s.id === 'sup-scoped')).toBe(false);

    const downtownResult = await getSuppliersAction({ tenantId, locationId });
    expect(downtownResult.data?.some((s) => s.id === 'sup-scoped')).toBe(true);
  });
});

describe('inventory feature actions — purchase orders', () => {
  const tenantId = 'tenant-arche';
  const locationId = 'loc-downtown';

  it('createPurchaseOrderAction rejects a bad payload', async () => {
    const result = await createPurchaseOrderAction({ supplierId: 'sup-1' });
    expect(result.success).toBe(false);
  });

  it('createPurchaseOrderAction generates the PO id and totals server-side', async () => {
    const result = await createPurchaseOrderAction({
      tenantId,
      locationId,
      supplierId: 'sup-1',
      supplierName: 'Iron Supply Co',
      items: [
        { productId: 'po-nutr-1', productName: 'Whey Protein', quantity: 4, unitPurchaseCost: 20000 },
      ],
    });
    expect(result.success).toBe(true);
    expect(result.data?.id).toBeTruthy();
    expect(result.data?.status).toBe('ORDERED');
    expect(result.data?.totalCost).toBe(80000);
  });

  it('receivePurchaseOrderAction marks the PO received, bumps stock, and logs intake with correct margin', async () => {
    await getNutrientRepository().create({ tenantId, locationId }, makeNutrient('po-nutr-2', 10));
    const price = 100000;
    await getNutrientRepository().update({ tenantId, locationId }, 'po-nutr-2', { price });

    const createResult = await createPurchaseOrderAction({
      tenantId,
      locationId,
      supplierId: 'sup-1',
      supplierName: 'Iron Supply Co',
      items: [
        { productId: 'po-nutr-2', productName: 'Whey Protein', quantity: 6, unitPurchaseCost: 70000 },
      ],
    });
    expect(createResult.success).toBe(true);
    const poId = createResult.data!.id;

    const receiveResult = await receivePurchaseOrderAction({ tenantId, locationId, poId });
    expect(receiveResult.success).toBe(true);
    expect(receiveResult.data?.status).toBe('RECEIVED');

    const nutrientsResult = await getNutrientsAction({ tenantId, locationId });
    const updatedNutrient = nutrientsResult.data?.find((n) => n.id === 'po-nutr-2');
    expect(updatedNutrient?.stock).toBe(16);

    const intakesResult = await getStockIntakesAction({ tenantId, locationId });
    const intake = intakesResult.data?.find((i) => i.purchaseOrderId === poId);
    expect(intake).toBeDefined();
    expect(intake?.quantity).toBe(6);
    expect(intake?.marginPercent).toBeCloseTo(30, 1);
  });

  it('receivePurchaseOrderAction fails for an unknown PO', async () => {
    const result = await receivePurchaseOrderAction({ tenantId, locationId, poId: 'no-such-po' });
    expect(result.success).toBe(false);
  });

  it('cancelPurchaseOrderAction marks the PO cancelled', async () => {
    const createResult = await createPurchaseOrderAction({
      tenantId,
      locationId,
      supplierId: 'sup-1',
      supplierName: 'Iron Supply Co',
      items: [{ productId: 'po-nutr-3', productName: 'Creatine', quantity: 2, unitPurchaseCost: 15000 }],
    });
    const poId = createResult.data!.id;

    const cancelResult = await cancelPurchaseOrderAction({ tenantId, locationId, poId });
    expect(cancelResult.success).toBe(true);
    expect(cancelResult.data?.status).toBe('CANCELLED');

    const listResult = await getPurchaseOrdersAction({ tenantId, locationId });
    expect(listResult.data?.find((po) => po.id === poId)?.status).toBe('CANCELLED');
  });
});

describe('inventory pure calculations', () => {
  it('calculatePOTotal sums quantity * unitPurchaseCost', () => {
    const total = calculatePOTotal([
      { quantity: 2, unitPurchaseCost: 1000 },
      { quantity: 3, unitPurchaseCost: 500 },
    ]);
    expect(total).toBe(3500);
  });

  it('calculateMarginPercent computes margin and avoids divide-by-zero', () => {
    expect(calculateMarginPercent(150, 100)).toBeCloseTo(33.33, 1);
    expect(calculateMarginPercent(0, 100)).toBe(0);
  });

  it('isLowStock / isOutOfStock use the documented thresholds', () => {
    expect(isOutOfStock(0)).toBe(true);
    expect(isLowStock(3)).toBe(true);
    expect(isLowStock(0)).toBe(false);
    expect(isLowStock(10)).toBe(false);
  });
});
