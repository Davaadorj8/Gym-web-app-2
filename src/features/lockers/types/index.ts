import { z } from "zod";
import type { LockerCustomStatus, LockerLog, LockerStatusDetail } from "@/lib/types";

const TenantContextSchema = z.object({
  tenantId: z.string().min(1),
  locationId: z.string().optional(),
});

export const LockerCustomStatusSchema = z.enum([
  "available",
  "occupied",
  "clean",
  "repair",
  "key_lost",
  "key_not_returned",
  "inactive",
]);

export const UpdateLockerStatusSchema = TenantContextSchema.extend({
  lockerNumber: z.string().min(1),
  status: LockerCustomStatusSchema,
  notes: z.string().optional(),
  updatedBy: z.string().optional(),
});

export const SetTotalLockersSchema = TenantContextSchema.extend({
  count: z.number().int().positive(),
});

export const LogLockerEventSchema = TenantContextSchema.extend({
  lockerNumber: z.string().min(1),
  memberId: z.string().min(1),
  memberName: z.string().min(1),
  eventType: z.enum(["Checked In", "Checked Out"]),
  eventDescription: z.string().min(1),
  statusLabel: z.enum(["Check-In Logged", "Key Returned"]),
  staffLogged: z.string().optional(),
  staffRole: z.enum(["admin", "staff"]).optional(),
  checkedInByStaffId: z.string().optional(),
});

export type UpdateLockerStatusInput = z.infer<typeof UpdateLockerStatusSchema>;
export type SetTotalLockersInput = z.infer<typeof SetTotalLockersSchema>;
export type LogLockerEventInput = z.infer<typeof LogLockerEventSchema>;

export type { LockerCustomStatus, LockerLog, LockerStatusDetail };
