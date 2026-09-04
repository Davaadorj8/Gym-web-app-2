"use server";

import { createSafeAction } from "@/server/actions/safeAction";
import { getLockerRepository, getLockerLogRepository } from "@/server/repositories";
import { z } from "zod";
import {
  UpdateLockerStatusSchema,
  SetTotalLockersSchema,
  LogLockerEventSchema,
} from "../types";

const TenantContextSchema = z.object({
  tenantId: z.string().min(1),
  locationId: z.string().optional(),
});

export const updateLockerStatusAction = createSafeAction(
  UpdateLockerStatusSchema,
  async (input) => {
    const repo = getLockerRepository();
    return repo.upsertStatus(
      { tenantId: input.tenantId, locationId: input.locationId },
      input.lockerNumber,
      input.status,
      input.notes,
      input.updatedBy
    );
  }
);

export const setTotalLockersAction = createSafeAction(
  SetTotalLockersSchema,
  async (input) => {
    const repo = getLockerRepository();
    return repo.setTotalCapacity(
      { tenantId: input.tenantId, locationId: input.locationId },
      input.count
    );
  }
);

export const logLockerEventAction = createSafeAction(
  LogLockerEventSchema,
  async (input) => {
    const repo = getLockerLogRepository();
    const now = new Date();
    return repo.create(
      { tenantId: input.tenantId, locationId: input.locationId },
      {
        id: `lockerlog-${now.getTime()}-${Math.floor(Math.random() * 1000)}`,
        lockerNumber: input.lockerNumber,
        memberId: input.memberId,
        memberName: input.memberName,
        eventType: input.eventType,
        eventDescription: input.eventDescription,
        timestamp: now.toISOString(),
        timeFormatted: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        statusLabel: input.statusLabel,
        staffLogged: input.staffLogged || "System",
        staffRole: input.staffRole,
        checkedInByStaffId: input.checkedInByStaffId,
      }
    );
  }
);

export const getLockerStatusesAction = createSafeAction(
  TenantContextSchema,
  async (ctx) => {
    const repo = getLockerRepository();
    const records = await repo.findAll(ctx);
    const statuses: Record<string, string> = {};
    for (const record of records) {
      statuses[record.lockerNumber] = record.status;
    }
    return statuses;
  }
);

export const getTotalLockersAction = createSafeAction(
  TenantContextSchema,
  async (ctx) => {
    const repo = getLockerRepository();
    return repo.getTotalCapacity(ctx);
  }
);
