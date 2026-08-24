import { z } from 'zod';

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
  } as unknown as RegistrationFormData);
