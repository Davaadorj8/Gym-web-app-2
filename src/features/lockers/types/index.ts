import { z } from "zod";
import type { UserRole } from "@/lib/types";

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

// Default physical locker count and display prefix for a location that hasn't
// configured its own capacity yet.
export const DEFAULT_LOCKER_CAPACITY = 60;
export const LOCKER_PREFIX = 'Locker #';

export type LockerCustomStatus =
  | 'available'
  | 'occupied'
  | 'clean'
  | 'repair'
  | 'key_lost'
  | 'key_not_returned'
  | 'inactive';

export interface LockerStatusDetail {
  id: string;
  lockerNumber: string;
  tenantId?: string;
  locationId?: string;
  status: LockerCustomStatus;
  updatedAt: string;
  notes?: string;
  updatedBy?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface LockerLog {
  id: string;
  tenantId?: string;
  locationId?: string;
  lockerNumber: string;
  memberId: string;
  memberName: string;
  eventType: 'Checked In' | 'Checked Out';
  eventDescription: string;
  timestamp: string;
  timeFormatted: string;
  statusLabel: 'Check-In Logged' | 'Key Returned';
  staffLogged: string;
  staffRole?: UserRole;
  checkedInByStaffId?: string;
}

// Dead subsystem — types/mock data exist but there's no real implementation or
// callers behind them yet. Flagged by prior maintainers for future cleanup, moved
// as-is (not fixed) as part of this domain-isolation pass.
export interface WaitlistEntry {
  id: string;
  tenantId?: string;
  locationId?: string;
  resourceType: 'LOCKER' | 'GYM_FLOOR';
  memberId: string;
  memberName: string;
  joinedAt: string;
  status: 'WAITING' | 'OFFERED' | 'CLAIMED' | 'EXPIRED';
  offerExpiresAt?: string;
  offeredLockerNumber?: string;
}

export const MOCK_LOCKER_LOGS: LockerLog[] = [];
