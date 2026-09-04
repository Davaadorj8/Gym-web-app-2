"use server";

import { createSafeAction } from "@/server/actions/safeAction";
import { getSupplierRepository } from "@/server/repositories";
import { z } from "zod";
import { AddSupplierSchema, UpdateSupplierSchema, DeleteSupplierSchema } from "../types";

const TenantContextSchema = z.object({
  tenantId: z.string().min(1),
  locationId: z.string().optional(),
});

export const addSupplierAction = createSafeAction(
  AddSupplierSchema,
  async (input) => {
    const repo = getSupplierRepository();
    return repo.create(
      { tenantId: input.tenantId, locationId: input.locationId },
      {
        id: `sup-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: input.name,
        contactEmail: input.contactEmail,
        phone: input.phone,
        leadTimeDays: input.leadTimeDays,
      }
    );
  }
);

export const updateSupplierAction = createSafeAction(
  UpdateSupplierSchema,
  async (input) => {
    const repo = getSupplierRepository();
    const updated = await repo.update(
      { tenantId: input.tenantId, locationId: input.locationId },
      input.id,
      {
        name: input.name,
        contactEmail: input.contactEmail,
        phone: input.phone,
        leadTimeDays: input.leadTimeDays,
      }
    );
    if (!updated) {
      throw new Error("Supplier not found");
    }
    return updated;
  }
);

export const deleteSupplierAction = createSafeAction(
  DeleteSupplierSchema,
  async (input) => {
    const repo = getSupplierRepository();
    const deleted = await repo.delete({ tenantId: input.tenantId, locationId: input.locationId }, input.id);
    if (!deleted) {
      throw new Error("Supplier not found");
    }
    return { id: input.id };
  }
);

export const getSuppliersAction = createSafeAction(
  TenantContextSchema,
  async (ctx) => {
    return getSupplierRepository().findAll(ctx);
  }
);
