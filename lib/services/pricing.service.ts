export interface PriceCalculationParams {
  basePlanPrice: number;
  durationMonths: number;
  promoCode?: string;
  groupSize?: number;
  prorationCredit?: number;
}

export interface PriceBreakdown {
  subtotal: number;
  discountAmount: number;
  prorationCredit: number;
  taxAmount: number;
  totalPayable: number;
}

/**
 * Standard promo code map for validation and calculations.
 */
export const VALID_PROMO_CODES: Record<string, { type: 'PERCENT' | 'FIXED'; value: number; description: string }> = {
  'SAVE10': { type: 'PERCENT', value: 0.10, description: '10% Off Single Purchase' },
  'SAVE20': { type: 'PERCENT', value: 0.20, description: '20% Off Single Purchase' },
  'WELCOME': { type: 'FIXED', value: 15000, description: '15,000 MNT Welcome Discount' },
  'FIXED20K': { type: 'FIXED', value: 20000, description: '20,000 MNT Fixed Discount' },
  'CORPORATE15': { type: 'PERCENT', value: 0.15, description: '15% Corporate Partner Discount' },
};

export class PricingService {
  /**
   * Calculates the full pricing breakdown including discounts, proration credits, and taxes.
   */
  static calculatePrice(params: PriceCalculationParams): PriceBreakdown {
    const subtotal = params.basePlanPrice * (params.durationMonths || 1);
    let discountAmount = 0;

    // 1. Promo Code discounts
    if (params.promoCode) {
      const code = params.promoCode.trim().toUpperCase();
      const match = VALID_PROMO_CODES[code];
      if (match) {
        if (match.type === 'PERCENT') {
          discountAmount += subtotal * match.value;
        } else if (match.type === 'FIXED') {
          discountAmount += match.value;
        }
      }
    }

    // 2. Group/Family bundling discounts (multi-user or corporate groups)
    if (params.groupSize && params.groupSize > 1) {
      if (params.groupSize >= 5) {
        discountAmount += subtotal * 0.15; // 15% bundle discount
      } else if (params.groupSize >= 3) {
        discountAmount += subtotal * 0.10; // 10% bundle discount
      } else if (params.groupSize === 2) {
        discountAmount += subtotal * 0.05; // 5% duo discount
      }
    }

    // Ensure discounts don't exceed the subtotal
    discountAmount = Math.min(subtotal, discountAmount);

    // 3. Plan Upgrade Proration credit
    const prorationCredit = params.prorationCredit || 0;

    // 4. Tax amount (e.g. 10% VAT, typical of modern systems)
    const afterDiscountAndCredit = Math.max(0, subtotal - discountAmount - prorationCredit);
    const taxAmount = Math.round(afterDiscountAndCredit * 0.10);

    // Total Payable
    const totalPayable = Math.max(0, afterDiscountAndCredit + taxAmount);

    return {
      subtotal,
      discountAmount: Math.round(discountAmount),
      prorationCredit: Math.round(prorationCredit),
      taxAmount: Math.round(taxAmount),
      totalPayable: Math.round(totalPayable),
    };
  }
}
