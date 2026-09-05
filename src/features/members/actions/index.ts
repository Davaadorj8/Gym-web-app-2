"use server";

import { createSafeAction } from "@/server/actions/safeAction";
import { CreateMemberSchema } from "../types";
import { getMemberRepository } from "@/server/repositories";
import { format } from "date-fns";

export const registerMemberAction = createSafeAction(
  CreateMemberSchema,
  async (input) => {
    const startDate = new Date(input.startDate);
    const expirationDate = new Date(startDate);
    expirationDate.setMonth(expirationDate.getMonth() + input.durationMonths);

    // Repository pattern: All data writes route purely through the repository interface
    const memberRepo = getMemberRepository();
    const created = await memberRepo.create({
      id: `mem-${Date.now()}`,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      dob: input.dob || undefined,
      gender: input.gender || undefined,
      emergencyContact: input.emergencyContact || undefined,
      medicalNotes: input.medicalNotes || undefined,
      photoUrl: input.photoUrl || null,
      planTitle: input.planTitle,
      planCategory: input.planCategory,
      durationMonths: input.durationMonths,
      startDate: format(startDate, 'yyyy-MM-dd'),
      expirationDate: format(expirationDate, 'yyyy-MM-dd'),
      status: "Active",
      isOrganization: input.isOrganization ?? false,
      orgName: input.orgName || undefined,
      occupancyStatus: "Checked Out",
      assignedLocker: input.assignedLocker || null,
    });

    return created;
  },
  "/dashboard"
);


