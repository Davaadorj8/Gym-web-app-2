import { z } from "zod";
import type { GymMember, CategoryTarget, MemberStatus, OccupancyStatus } from "@/lib/types";

export const MemberStatusSchema = z.enum(["Active", "Expired", "Suspended", "Pending"]);
export const OccupancyStatusSchema = z.enum(["Checked In", "Checked Out"]);
export const CategoryTargetSchema = z.enum(["under18", "over18", "organization"]);

export const CanonicalMemberSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  dob: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  medicalNotes: z.string().optional().nullable(),
  photoUrl: z.string().nullable().optional(),
  profileImage: z.string().optional(),
  planTitle: z.string().min(1, "Plan selection is required"),
  planCategory: CategoryTargetSchema.default("over18"),
  durationMonths: z.number().int().positive(),
  startDate: z.string(),
  expirationDate: z.string(),
  status: MemberStatusSchema.default("Active"),
  isOrganization: z.boolean().default(false),
  orgName: z.string().optional().nullable(),
  occupancyStatus: OccupancyStatusSchema.default("Checked Out"),
  assignedLocker: z.string().nullable().optional(),
  lastCheckInTime: z.string().optional().nullable(),
});

export const CreateMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please provide a valid email"),
  phone: z.string().min(5, "Phone number is required"),
  planTitle: z.string().min(1, "Plan selection is required"),
  planCategory: CategoryTargetSchema.default("over18"),
  durationMonths: z.number().int().positive().default(1),
  startDate: z.string(),
  assignedLocker: z.string().nullable().optional(),
  dob: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  photoUrl: z.string().nullable().optional(),
  emergencyContact: z.string().optional().nullable(),
  medicalNotes: z.string().optional().nullable(),
  isOrganization: z.boolean().optional().default(false),
  orgName: z.string().optional().nullable(),
});

export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;
export type CanonicalMember = z.infer<typeof CanonicalMemberSchema>;

// Alias for domain compatibility
export type MemberRecord = GymMember;
