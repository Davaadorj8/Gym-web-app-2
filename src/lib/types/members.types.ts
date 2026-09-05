export type CategoryTarget = 'under18' | 'over18' | 'organization';

export interface BuiltPlan {
  id: string;
  tenantId?: string;
  locationId?: string;
  categoryTarget: CategoryTarget;
  title: string;
  titleMn?: string;
  specializedLessons?: string;
  durationMonths: number;
  price: number;
  isCustom?: boolean;
}

export interface MembershipExtensionLog {
  id: string;
  tenantId?: string;
  locationId?: string;
  extendedAt: string;
  timeFormatted: string;
  monthsAdded: number;
  previousExpirationDate: string;
  newExpirationDate: string;
  staffLogged?: string;
  feePaid?: number;
  paymentMethod?: string;
  memberCategory?: CategoryTarget;
  memberId?: string;
  memberName?: string;
}

export type MemberStatus = 'Active' | 'Expired' | 'Suspended' | 'Pending' | 'Cancelled' | 'Refunded';
export type OccupancyStatus = 'Checked In' | 'Checked Out';

export type TransactionType = 'PAYMENT' | 'REFUND' | 'CREDIT_ADJUSTMENT';

export interface MembershipTransaction {
  id: string;
  tenantId?: string;
  locationId?: string;
  memberId: string;
  memberName: string;
  amount: number;
  type: TransactionType;
  timestamp: string;
  timeFormatted: string;
  planTitle?: string;
  notes?: string;
  staffLogged?: string;
}

export interface GymMember {
  id: string;
  tenantId?: string;
  locationId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob?: string;
  gender?: string;
  emergencyContact?: string;
  medicalNotes?: string;
  photoUrl?: string | null;
  profileImage?: string;
  planTitle: string;
  planCategory?: CategoryTarget;
  durationMonths: number;
  startDate: string;
  expirationDate: string;
  status: MemberStatus;
  isOrganization?: boolean;
  orgName?: string;
  occupancyStatus: OccupancyStatus;
  assignedLocker?: string | null;
  lastCheckInTime?: string;
  extensionHistory?: MembershipExtensionLog[];
  deletedAt?: string | null;
  deletedBy?: string | null;
  pinCode?: string;
  phoneNumber?: string;
}

export const getMemberFullName = (member: { firstName: string; lastName: string }): string =>
  `${member.firstName} ${member.lastName}`.trim();

export const MOCK_BUILT_PLANS: BuiltPlan[] = [];

export const MOCK_GYM_MEMBERS: GymMember[] = [
  {
    id: 'mem-101',
    tenantId: 'tenant-arche',
    locationId: 'loc-downtown',
    firstName: 'Bataa',
    lastName: 'Bold',
    email: 'bataa.b@gmail.com',
    phone: '9911-1234',
    planTitle: 'Full Gym + Spa Annual',
    planCategory: 'over18',
    durationMonths: 12,
    startDate: '2026-01-10',
    expirationDate: '2027-01-10',
    status: 'Active',
    occupancyStatus: 'Checked In',
    assignedLocker: 'L-12',
    lastCheckInTime: '2026-08-28T09:15:00.000Z',
  },
  {
    id: 'mem-102',
    tenantId: 'tenant-arche',
    locationId: 'loc-downtown',
    firstName: 'Tuya',
    lastName: 'Ganbaatar',
    email: 'tuya.g@yahoo.com',
    phone: '9922-5678',
    planTitle: 'Student Monthly Express',
    planCategory: 'under18',
    durationMonths: 1,
    startDate: '2026-08-01',
    expirationDate: '2026-09-01',
    status: 'Active',
    occupancyStatus: 'Checked Out',
  },
  {
    id: 'mem-103',
    tenantId: 'tenant-arche',
    locationId: 'loc-uptown',
    firstName: 'Anand',
    lastName: 'Erdene',
    email: 'anand.e@company.mn',
    phone: '8811-4321',
    planTitle: 'Corporate Executive Pass',
    planCategory: 'organization',
    durationMonths: 6,
    startDate: '2026-05-15',
    expirationDate: '2026-11-15',
    status: 'Active',
    isOrganization: true,
    orgName: 'Mobicom Corp',
    occupancyStatus: 'Checked In',
    assignedLocker: 'L-04',
    lastCheckInTime: '2026-08-28T10:00:00.000Z',
  },
  {
    id: 'mem-104',
    tenantId: 'tenant-arche',
    locationId: 'loc-westside',
    firstName: 'Sarnai',
    lastName: 'Dorj',
    email: 'sarnai.d@gmail.com',
    phone: '9988-7766',
    planTitle: 'CrossFit & Strength Monthly',
    planCategory: 'over18',
    durationMonths: 3,
    startDate: '2026-06-01',
    expirationDate: '2026-09-01',
    status: 'Active',
    occupancyStatus: 'Checked Out',
  },
];
