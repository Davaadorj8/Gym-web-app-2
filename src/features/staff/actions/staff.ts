"use server";

import { createSafeAction } from "@/server/actions/safeAction";
import { getStaffRepository } from "../repository";
import { hashPassword } from "@/server/security/password";
import { z } from "zod";
import {
  RegisterStaffSchema,
  UpdateStaffSchema,
  DeleteStaffSchema,
  ResetStaffPasswordSchema,
} from "../types";

const TenantContextSchema = z.object({
  tenantId: z.string().min(1),
  locationId: z.string().optional(),
});

export const registerStaffAction = createSafeAction(
  RegisterStaffSchema,
  async (input) => {
    const repo = getStaffRepository();
    const ctx = { tenantId: input.tenantId, locationId: input.locationId };

    const existing = await repo.findByUsername(ctx, input.username);
    if (existing) {
      throw new Error(`Username "${input.username}" is already registered.`);
    }

    const passwordHash = await hashPassword(input.password);

    return repo.create(ctx, {
      id: `staff-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      username: input.username,
      passwordHash,
      plainTextPasswordForDemo: input.password,
      fullName: input.fullName,
      email: input.email,
      phoneNumber: input.phoneNumber,
      role: input.role,
      assignedShift: input.assignedShift,
      status: input.status,
      registeredAt: new Date().toISOString(),
      registeredBy: input.registeredBy,
      notes: input.notes,
      permissions: input.permissions,
    });
  }
);

export const updateStaffAction = createSafeAction(
  UpdateStaffSchema,
  async (input) => {
    const repo = getStaffRepository();
    const updated = await repo.update(
      { tenantId: input.tenantId, locationId: input.locationId },
      input.id,
      {
        fullName: input.fullName,
        email: input.email,
        phoneNumber: input.phoneNumber,
        role: input.role,
        assignedShift: input.assignedShift,
        status: input.status,
        notes: input.notes,
        permissions: input.permissions,
      }
    );
    if (!updated) {
      throw new Error("Staff account not found");
    }
    return updated;
  }
);

export const deleteStaffAction = createSafeAction(
  DeleteStaffSchema,
  async (input) => {
    const repo = getStaffRepository();
    const deleted = await repo.delete(
      { tenantId: input.tenantId, locationId: input.locationId },
      input.id
    );
    if (!deleted) {
      throw new Error("Staff account not found");
    }
    return { id: input.id };
  }
);

export const resetStaffPasswordAction = createSafeAction(
  ResetStaffPasswordSchema,
  async (input) => {
    const repo = getStaffRepository();
    const passwordHash = await hashPassword(input.newPassword);
    const updated = await repo.update(
      { tenantId: input.tenantId, locationId: input.locationId },
      input.id,
      {
        passwordHash,
        plainTextPasswordForDemo: input.newPassword,
      }
    );
    if (!updated) {
      throw new Error("Staff account not found");
    }
    return updated;
  }
);

export const getStaffAction = createSafeAction(
  TenantContextSchema,
  async (ctx) => {
    return getStaffRepository().findAll(ctx);
  }
);
