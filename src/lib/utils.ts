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
