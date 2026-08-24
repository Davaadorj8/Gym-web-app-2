"use server";

import { createSafeAction } from "@/lib/actions/safeAction";
import { RegistrationSchema } from "../types";
import { getMemberRepository } from "@/lib/repositories";
import { addMonths, format } from "date-fns";

export const processRegistrationAction = createSafeAction(
  RegistrationSchema,
  async (data) => {
    const memberRepo = getMemberRepository();
    const startDateStr = format(new Date(), 'yyyy-MM-dd');
    const expDateStr = format(addMonths(new Date(), data.durationMultiplier || 1), 'yyyy-MM-dd');

    if (data.registrationType === 'individual') {
      const created = await memberRepo.create({
        id: data.member.id || `mem-${Date.now()}`,
        firstName: data.member.firstName,
        lastName: data.member.lastName,
        email: data.member.email || '',
        phone: data.member.phone || '',
        dob: data.member.dob || '',
        gender: data.member.gender || 'Male',
        emergencyContact: data.member.emergencyContact || '',
        medicalNotes: data.member.medicalNotes || '',
        photoUrl: data.member.photo || null,
        planTitle: data.selectedPlanId,
        durationMonths: data.durationMultiplier,
        startDate: startDateStr,
        expirationDate: expDateStr,
        status: 'Active',
        occupancyStatus: 'Checked Out',
        assignedLocker: null,
      });

      return {
        success: true,
        memberCount: 1,
        primaryMemberId: created.id,
      };
    } else {
      // Organization registration
      const createdMembers = await Promise.all(
        data.orgMembers.map((m, idx) =>
          memberRepo.create({
            id: m.id || `org-${Date.now()}-${idx}`,
            firstName: m.firstName,
            lastName: m.lastName,
            email: m.email || data.orgLeadEmail || '',
            phone: m.phone || data.orgLeadPhone || '',
            dob: m.dob || '',
            gender: m.gender || 'Male',
            emergencyContact: m.emergencyContact || '',
            medicalNotes: m.medicalNotes || '',
            photoUrl: m.photo || null,
            planTitle: data.selectedPlanId,
            durationMonths: data.durationMultiplier,
            startDate: startDateStr,
            expirationDate: expDateStr,
            status: 'Active',
            isOrganization: true,
            orgName: data.orgName,
            occupancyStatus: 'Checked Out',
            assignedLocker: null,
          })
        )
      );

      return {
        success: true,
        memberCount: createdMembers.length,
        primaryMemberId: createdMembers[0]?.id,
      };
    }
  },
  "/dashboard"
);
