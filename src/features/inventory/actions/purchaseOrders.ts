"use server";

import { createSafeAction } from "@/server/actions/safeAction";
import {
  getPurchaseOrderRepository,
  getStockIntakeRepository,
  getNutrientRepository,
} from "@/server/repositories";
import { calculatePOTotal, calculateMarginPercent } from "@/lib/services";
import { z } from "zod";
import {
  CreatePurchaseOrderSchema,
  ReceivePurchaseOrderSchema,
  CancelPurchaseOrderSchema,
} from "../types";
import type { POItem } from "@/lib/types";

const TenantContextSchema = z.object({
  tenantId: z.string().min(1),
  locationId: z.string().optional(),
});

export const createPurchaseOrderAction = createSafeAction(
  CreatePurchaseOrderSchema,
  async (input) => {
    const repo = getPurchaseOrderRepository();
    const poId = `po-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const items: POItem[] = input.items.map((item, idx) => ({
      id: `poi-${poId}-${idx}`,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPurchaseCost: item.unitPurchaseCost,
    }));

    return repo.create(
      { tenantId: input.tenantId, locationId: input.locationId },
      {
        id: poId,
        supplierId: input.supplierId,
        supplierName: input.supplierName,
        status: "ORDERED",
        items,
        totalCost: calculatePOTotal(items),
        createdAt: new Date().toISOString(),
      }
    );
  }
);

export const receivePurchaseOrderAction = createSafeAction(
  ReceivePurchaseOrderSchema,
  async (input) => {
    const ctx = { tenantId: input.tenantId, locationId: input.locationId };
    const poRepo = getPurchaseOrderRepository();
    const nutrientRepo = getNutrientRepository();
    const stockIntakeRepo = getStockIntakeRepository();

    const updatedPo = await poRepo.markReceived(ctx, input.poId);
    if (!updatedPo) {
      throw new Error("Purchase order not found");
    }

    // Sequential awaits deliberately, not Promise.all/forEach: this mirrors what a real
    // transaction would do (one item at a time, each fully applied before the next) and
    // avoids the double-invoke hazard the old client-side cascade had (it mutated an array
    // from inside a nested React state-updater callback).
    for (const item of updatedPo.items) {
      const product = await nutrientRepo.findById(ctx, item.productId);
      if (!product) continue;

      const marginPercent = calculateMarginPercent(product.price, item.unitPurchaseCost);
      await nutrientRepo.adjustStock(ctx, item.productId, item.quantity);
      await stockIntakeRepo.create(ctx, {
        id: `intake-${Date.now()}-${item.productId}`,
        purchaseOrderId: input.poId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPurchaseCost: item.unitPurchaseCost,
        unitSellingPrice: product.price,
        marginPercent,
        timestamp: new Date().toISOString(),
      });
    }

    return updatedPo;
  }
);

export const cancelPurchaseOrderAction = createSafeAction(
  CancelPurchaseOrderSchema,
  async (input) => {
    const repo = getPurchaseOrderRepository();
    const updated = await repo.markCancelled(
      { tenantId: input.tenantId, locationId: input.locationId },
      input.poId
    );
    if (!updated) {
      throw new Error("Purchase order not found");
    }
    return updated;
  }
);

export const getPurchaseOrdersAction = createSafeAction(
  TenantContextSchema,
  async (ctx) => {
    return getPurchaseOrderRepository().findAll(ctx);
  }
);

export const getStockIntakesAction = createSafeAction(
  TenantContextSchema,
  async (ctx) => {
    return getStockIntakeRepository().findAll(ctx);
  }
);
