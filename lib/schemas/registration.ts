import { z } from 'zod';
import { GymMember } from '@/lib/types';
import { calculateExpirationDate, generateMemberId } from '@/lib/registration-utils';

export const MemberSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  dob: z.string().optional().or(z.literal('')),
  gender: z.enum(['Male', 'Female', 'Non-Binary', 'Prefer not to say']),
  role: z.string().optional().or(z.literal('')),
  photo: z.string().nullable().optional(),
  address: z.string().optional().or(z.literal('')),
  emergencyContact: z.string().optional().or(z.literal('')),
  medicalNotes: z.string().optional().or(z.literal('')),
});

export const RegistrationSchema = z
  .discriminatedUnion('registrationType', [
    z.object({
      registrationType: z.literal('individual'),
      member: MemberSchema,
    }),
    z.object({
      registrationType: z.literal('organization'),
      orgName: z.string().min(1, 'Organization name is required'),
      orgTaxId: z.string().optional().or(z.literal('')),
      orgLeadName: z.string().min(1, 'Lead coordinator name is required'),
      orgLeadEmail: z.string().email('Invalid lead email').optional().or(z.literal('')),
      orgLeadPhone: z.string().min(1, 'Lead phone number is required'),
      orgAddress: z.string().optional().or(z.literal('')),
      orgMembers: z.array(MemberSchema).min(1, 'At least one roster member is required'),
    }),
  ])
  .and(
    z.object({
      selectedPlanId: z.string().min(1, 'Please select a membership plan'),
      durationMultiplier: z.number().min(1).max(36),
      paymentMethod: z.enum(['Card', 'Cash', 'Transfer']),
    })
  );

export type MemberFormData = z.infer<typeof MemberSchema>;
export type RegistrationFormData = z.infer<typeof RegistrationSchema>;

export const createDefaultMember = (idSuffix?: string): MemberFormData => ({
  id: `mem-${Date.now()}-${idSuffix || Math.random().toString(36).substring(2, 7)}`,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dob: '',
  gender: 'Male',
  role: '',
  photo: null,
  address: '',
  emergencyContact: '',
  medicalNotes: '',
});

export const getDefaultRegistrationValues = (initialPlanId = ''): RegistrationFormData =>
  ({
    registrationType: 'individual',
    member: createDefaultMember('init'),
    orgName: '',
    orgTaxId: '',
    orgLeadName: '',
    orgLeadEmail: '',
    orgLeadPhone: '',
    orgAddress: '',
    orgMembers: [createDefaultMember('org-1')],
    selectedPlanId: initialPlanId,
    durationMultiplier: 1,
    paymentMethod: 'Card',
  } as RegistrationFormData);

export function transformRegistrationToGymMember(
  data: RegistrationFormData,
  plans: Array<{ id: string; title: string; titleMn?: string; categoryTarget?: 'under18' | 'over18' | 'organization' }>,
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
