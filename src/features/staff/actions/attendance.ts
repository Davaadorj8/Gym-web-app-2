"use server";

import { createSafeAction } from "@/server/actions/safeAction";
import { getStaffAttendanceRepository } from "../repository";
import { z } from "zod";
import { ClockInSchema, ClockOutSchema } from "../types";

const TenantContextSchema = z.object({
  tenantId: z.string().min(1),
  locationId: z.string().optional(),
});

export const clockInAction = createSafeAction(
  ClockInSchema,
  async (input) => {
    const repo = getStaffAttendanceRepository();
    return repo.create(
      { tenantId: input.tenantId, locationId: input.locationId },
      {
        id: `attendance-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        staffId: input.staffId,
        staffName: input.staffName,
        shiftId: input.shiftId,
        clockInTime: new Date().toISOString(),
        status: "ON_DUTY",
      }
    );
  }
);

export const clockOutAction = createSafeAction(
  ClockOutSchema,
  async (input) => {
    const repo = getStaffAttendanceRepository();
    const updated = await repo.update(
      { tenantId: input.tenantId, locationId: input.locationId },
      input.attendanceId,
      {
        clockOutTime: new Date().toISOString(),
        status: "COMPLETED",
      }
    );
    if (!updated) {
      throw new Error("Attendance record not found");
    }
    return updated;
  }
);

export const getAttendancesAction = createSafeAction(
  TenantContextSchema,
  async (ctx) => {
    return getStaffAttendanceRepository().findAll(ctx);
  }
);
