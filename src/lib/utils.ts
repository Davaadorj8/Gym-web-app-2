import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const CURRENCY_SYMBOL = '₮';
export const CURRENCY_CODE = 'MNT';

/**
 * Formats a monetary number into Mongolian Tugrik display (e.g. "120,000₮" or "₮120,000").
 */
export function formatCurrency(amount: number | string | undefined | null, prefix = false): string {
  const num = typeof amount === 'number' ? amount : Number(amount || 0);
  const formatted = Math.round(num).toLocaleString('mn-MN');
  return prefix ? `₮${formatted}` : `${formatted}₮`;
}

export type ExpiryStatus = 'expired' | 'expiring_soon' | 'fresh' | 'none';

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
