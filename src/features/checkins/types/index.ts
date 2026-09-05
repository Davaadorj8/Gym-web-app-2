import { z } from "zod";

const TenantContextSchema = z.object({
  tenantId: z.string().min(1),
  locationId: z.string().optional(),
});

export const CheckInMemberSchema = TenantContextSchema.extend({
  memberId: z.string().min(1),
  lockerNumber: z.string().min(1),
});

export const CheckOutMemberSchema = TenantContextSchema.extend({
  memberId: z.string().min(1),
});

export type CheckInMemberInput = z.infer<typeof CheckInMemberSchema>;
export type CheckOutMemberInput = z.infer<typeof CheckOutMemberSchema>;
