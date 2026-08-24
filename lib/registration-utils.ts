import { BuiltPlan, GymMember } from '@/lib/types';
import { RegistrationFormData } from '@/features/registration/types';

export const DURATION_OPTIONS = [
  { labelEn: '1 Mo', labelMn: '1 Сар', multiplier: 1 },
  { labelEn: '2 Mo', labelMn: '2 Сар', multiplier: 2 },
  { labelEn: '3 Mo', labelMn: '3 Сар', multiplier: 3 },
  { labelEn: '6 Mo', labelMn: '6 Сар', multiplier: 6 },
  { labelEn: '12 Mo', labelMn: '12 Сар', multiplier: 12 },
];

/**
 * Calculates expiration date formatted as YYYY-MM-DD from a start date and month count.
 */
export function calculateExpirationDate(startDate: Date, durationMonths: number): string {
  const expDate = new Date(startDate);
  expDate.setMonth(expDate.getMonth() + durationMonths);
  const year = expDate.getFullYear();
  const month = String(expDate.getMonth() + 1).padStart(2, '0');
  const day = String(expDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date to MM/DD/YYYY display.
 */
export function formatDateForDisplay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Generates an athlete ID with prefix and random alphanumeric token.
 */
export function generateMemberId(prefix = 'IP', firstName?: string): string {
  const charCode = firstName ? firstName[0].toUpperCase() : 'A';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}-${charCode}`;
}

/**
 * Calculates the total membership fee based on selected plan and duration multiplier.
 */
export function calculateRegistrationFee(
  plan: BuiltPlan | null | undefined,
  multiplier: number
): string {
  if (!plan) return '0.00';
  const monthlyRate = plan.price / (plan.durationMonths || 1);
  return (monthlyRate * multiplier).toFixed(2);
}

/**
 * Transforms validated registration form data into a GymMember entity.
 */
export function transformRegistrationToGymMember(
  data: RegistrationFormData,
  plans: BuiltPlan[],
  isMn = false
): GymMember {
  const today = new Date();
  const activePlan = plans.find((p) => p.id === data.selectedPlanId);
  const expirationDate = calculateExpirationDate(today, data.durationMultiplier);

  const planTitle = activePlan
    ? isMn && activePlan.titleMn
      ? activePlan.titleMn
      : activePlan.title
    : 'Standard Membership';

  if (data.registrationType === 'individual') {
    const member = data.member;
    const memberId = generateMemberId('IP', member.firstName);

    return {
      id: memberId,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email || '',
      phone: member.phone || '',
      dob: member.dob || '',
      gender: member.gender,
      emergencyContact: member.emergencyContact || 'N/A',
      medicalNotes: member.medicalNotes || 'None',
      photoUrl: member.photo || null,
      planTitle,
      planCategory: activePlan?.categoryTarget || 'over18',
      durationMonths: data.durationMultiplier,
      startDate: today.toISOString().split('T')[0],
      expirationDate,
      status: 'Active',
      isOrganization: false,
      occupancyStatus: 'Checked Out',
      assignedLocker: null,
    };
  }

  // Organization registration
  const firstMemberPhoto = data.orgMembers[0]?.photo || null;
  const orgMemberId = generateMemberId('ORG', data.orgName);

  return {
    id: orgMemberId,
    firstName: data.orgName,
    lastName: data.orgLeadName,
    email: data.orgLeadEmail || '',
    phone: data.orgLeadPhone,
    gender: 'Prefer not to say',
    emergencyContact: `${data.orgLeadName} (${data.orgLeadPhone})`,
    medicalNotes: `Corporate group registration (${data.orgMembers.length} roster members)`,
    photoUrl: firstMemberPhoto,
    planTitle,
    planCategory: 'organization',
    durationMonths: data.durationMultiplier,
    startDate: today.toISOString().split('T')[0],
    expirationDate,
    status: 'Active',
    isOrganization: true,
    orgName: data.orgName,
    occupancyStatus: 'Checked Out',
    assignedLocker: null,
  };
}
