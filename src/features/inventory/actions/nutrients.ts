"use server";

import { createSafeAction } from "@/server/actions/safeAction";
import { getNutrientRepository, getNutrientSaleRepository } from "../repository";
import { z } from "zod";
import {
  AddNutrientSchema,
  UpdateNutrientSchema,
  DeleteNutrientSchema,
  UpdateNutrientPriceSchema,
  RecordNutrientSaleSchema,
} from "../types";

const TenantContextSchema = z.object({
  tenantId: z.string().min(1),
  locationId: z.string().optional(),
});

export const addNutrientAction = createSafeAction(
  AddNutrientSchema,
  async (input) => {
    const repo = getNutrientRepository();
    return repo.create(
      { tenantId: input.tenantId, locationId: input.locationId },
      {
        id: `nutr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: input.name,
        category: input.category,
        price: input.price,
        stock: input.stock,
        servingSize: input.servingSize,
        flavor: input.flavor,
        bestBeforeDate: input.bestBeforeDate,
      }
    );
  }
);

export const updateNutrientAction = createSafeAction(
  UpdateNutrientSchema,
  async (input) => {
    const repo = getNutrientRepository();
    const updated = await repo.update(
      { tenantId: input.tenantId, locationId: input.locationId },
      input.id,
      {
        name: input.name,
        category: input.category,
        price: input.price,
        stock: input.stock,
        servingSize: input.servingSize,
        flavor: input.flavor,
        bestBeforeDate: input.bestBeforeDate,
      }
    );
    if (!updated) {
      throw new Error("Nutrient product not found");
    }
    return updated;
  }
);

export const deleteNutrientAction = createSafeAction(
  DeleteNutrientSchema,
  async (input) => {
    const repo = getNutrientRepository();
    const deleted = await repo.delete({ tenantId: input.tenantId, locationId: input.locationId }, input.id);
    if (!deleted) {
      throw new Error("Nutrient product not found");
    }
    return { id: input.id };
  }
);

export const updateNutrientPriceAction = createSafeAction(
  UpdateNutrientPriceSchema,
  async (input) => {
    const repo = getNutrientRepository();
    const updated = await repo.update(
      { tenantId: input.tenantId, locationId: input.locationId },
      input.id,
      { price: input.price }
    );
    if (!updated) {
      throw new Error("Nutrient product not found");
    }
    return updated;
  }
);

export const recordNutrientSaleAction = createSafeAction(
  RecordNutrientSaleSchema,
  async (input) => {
    const saleRepo = getNutrientSaleRepository();
    const nutrientRepo = getNutrientRepository();
    const ctx = { tenantId: input.tenantId, locationId: input.locationId };

    const now = new Date();
    const sale = await saleRepo.create(ctx, {
      id: `sale-${now.getTime()}-${Math.floor(Math.random() * 1000)}`,
      productId: input.productId,
      productName: input.productName,
      category: input.category,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      totalPrice: input.totalPrice,
      timestamp: now.toISOString(),
      timeFormatted: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      paymentMethod: input.paymentMethod,
      memberId: input.memberId,
      memberName: input.memberName,
      buyerName: input.buyerName,
      staffLogged: input.staffLogged,
      staffName: input.staffName,
    });

    await nutrientRepo.adjustStock(ctx, input.productId, -input.quantity);

    return sale;
  }
);

export const getNutrientsAction = createSafeAction(
  TenantContextSchema,
  async (ctx) => {
    return getNutrientRepository().findAll(ctx);
  }
);

export const getNutrientSalesAction = createSafeAction(
  TenantContextSchema,
  async (ctx) => {
    return getNutrientSaleRepository().findAll(ctx);
  }
);
