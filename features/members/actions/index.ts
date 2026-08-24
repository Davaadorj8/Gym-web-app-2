"use server";

import prisma from "@/lib/prisma";
import { createSafeAction } from "@/lib/actions/safeAction";
import { CreateMemberSchema } from "../types";

export const registerMemberAction = createSafeAction(
  CreateMemberSchema,
  async (input) => {
    const startDate = new Date(input.startDate);
    const expirationDate = new Date(startDate);
    expirationDate.setMonth(expirationDate.getMonth() + input.durationMonths);

    const created = await prisma.member.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        dob: input.dob || null,
        gender: input.gender || null,
        photoUrl: input.photoUrl || null,
        emergencyContact: input.emergencyContact || null,
        medicalNotes: input.medicalNotes || null,
        planTitle: input.planTitle,
        planCategory: input.planCategory,
        durationMonths: input.durationMonths,
        startDate,
        expirationDate,
        status: "Active",
        isOrganization: input.isOrganization ?? false,
        orgName: input.orgName || null,
        occupancyStatus: "Checked Out",
        assignedLocker: input.assignedLocker || null,
      },
    });

    return created;
  },
  "/dashboard"
);
