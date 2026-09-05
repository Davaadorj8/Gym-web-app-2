import { POItem } from './types';

export type ExpiryStatus = 'expired' | 'expiring_soon' | 'fresh' | 'none';

export const LOW_STOCK_THRESHOLD = 5;

/**
 * Computes the expiry status of a nutrient product based on its best before date.
 */
export function getNutrientExpiryStatus(bestBeforeDate?: string): ExpiryStatus {
  if (!bestBeforeDate) return 'none';
  const target = new Date(bestBeforeDate);
  if (isNaN(target.getTime())) return 'none';

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const targetDay = new Date(target);
  targetDay.setHours(0, 0, 0, 0);

  const diffMs = targetDay.getTime() - now.getTime();
  if (diffMs < 0) {
    return 'expired';
  }
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 30) {
    return 'expiring_soon';
  }
  return 'fresh';
}

/**
 * Sums a purchase order's line items into its total cost.
 */
export function calculatePOTotal(items: Pick<POItem, 'quantity' | 'unitPurchaseCost'>[]): number {
  return items.reduce((acc, item) => acc + item.quantity * item.unitPurchaseCost, 0);
}

/**
 * Computes the margin percentage between a product's current selling price and
 * its purchase cost, rounded to 2 decimal places. Returns 0 if sellingPrice is 0
 * (avoids a division-by-zero producing Infinity/NaN).
 */
export function calculateMarginPercent(sellingPrice: number, purchaseCost: number): number {
  if (sellingPrice <= 0) return 0;
  return Number((((sellingPrice - purchaseCost) / sellingPrice) * 100).toFixed(2));
}

export function isLowStock(stock: number, threshold: number = LOW_STOCK_THRESHOLD): boolean {
  return stock > 0 && stock <= threshold;
}

export function isOutOfStock(stock: number): boolean {
  return stock <= 0;
}
