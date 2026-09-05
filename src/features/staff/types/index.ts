import { z } from "zod";
import type { StaffAccount, StaffAttendance } from "@/lib/types";

const TenantContextSchema = z.object({
  tenantId: z.string().min(1),
  locationId: z.string().optional(),
});

export const StaffRoleSchema = z.enum([
  "Front Desk Staff",
  "Gym Trainer",
  "Shift Lead",
  "Assistant Manager",
]);

export const StaffStatusSchema = z.enum(["Active", "Pending", "Suspended"]);

export const RegisterStaffSchema = TenantContextSchema.extend({
  username: z.string().min(3),
  password: z.string().min(4),
  fullName: z.string().min(1),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  role: StaffRoleSchema,
  assignedShift: z.string().optional(),
  status: z.enum(["Active", "Pending"]),
  notes: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  registeredBy: z.string().min(1),
});

export const UpdateStaffSchema = TenantContextSchema.extend({
  id: z.string().min(1),
  fullName: z.string().min(1),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  role: StaffRoleSchema,
  assignedShift: z.string().optional(),
  status: StaffStatusSchema,
  notes: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export const DeleteStaffSchema = TenantContextSchema.extend({
  id: z.string().min(1),
});

export const ResetStaffPasswordSchema = TenantContextSchema.extend({
  id: z.string().min(1),
  newPassword: z.string().min(4),
});

export const ClockInSchema = TenantContextSchema.extend({
  staffId: z.string().min(1),
  staffName: z.string().min(1),
  shiftId: z.string().min(1),
});

export const ClockOutSchema = TenantContextSchema.extend({
  attendanceId: z.string().min(1),
});

export type RegisterStaffInput = z.infer<typeof RegisterStaffSchema>;
export type UpdateStaffInput = z.infer<typeof UpdateStaffSchema>;
export type DeleteStaffInput = z.infer<typeof DeleteStaffSchema>;
export type ResetStaffPasswordInput = z.infer<typeof ResetStaffPasswordSchema>;
export type ClockInInput = z.infer<typeof ClockInSchema>;
export type ClockOutInput = z.infer<typeof ClockOutSchema>;

export type { StaffAccount, StaffAttendance };
