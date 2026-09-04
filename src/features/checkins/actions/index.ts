"use server";

import { createSafeAction } from "@/server/actions/safeAction";
import { getMemberRepository } from "@/server/repositories";
import { CheckInMemberSchema, CheckOutMemberSchema } from "../types";

export const checkInMemberAction = createSafeAction(
  CheckInMemberSchema,
  async (input) => {
    const memberRepo = getMemberRepository();
    const updated = await memberRepo.updateCheckInStatus(
      { tenantId: input.tenantId, locationId: input.locationId },
      input.memberId,
      "Checked In",
      input.lockerNumber
    );
    if (!updated) {
      throw new Error("Member not found");
    }
    return updated;
  }
);

export const checkOutMemberAction = createSafeAction(
  CheckOutMemberSchema,
  async (input) => {
    const memberRepo = getMemberRepository();
    const updated = await memberRepo.updateCheckInStatus(
      { tenantId: input.tenantId, locationId: input.locationId },
      input.memberId,
      "Checked Out",
      null
    );
    if (!updated) {
      throw new Error("Member not found");
    }
    return updated;
  }
);
