import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryNutrientRepository, InMemoryNutrientSaleRepository } from '@/server/repositories/in-memory';
import { NutrientProduct } from '@/lib/types';
import {
  addNutrientAction,
  recordNutrientSaleAction,
  getNutrientsAction,
  getNutrientSalesAction,
  updateNutrientPriceAction,
  deleteNutrientAction,
} from '@/features/inventory';
import { getNutrientRepository } from '@/server/repositories';
import { calculateMarginPercent, calculatePOTotal, isLowStock, isOutOfStock } from '@/lib/services';

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
