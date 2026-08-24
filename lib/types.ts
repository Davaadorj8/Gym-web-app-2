export type CategoryTarget = 'under18' | 'over18' | 'organization';

export interface BuiltPlan {
  id: string;
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

export type MemberStatus = 'Active' | 'Expired' | 'Suspended' | 'Pending';
export type OccupancyStatus = 'Checked In' | 'Checked Out';

export interface GymMember {
  id: string;
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
}

export const getMemberFullName = (member: { firstName: string; lastName: string }): string =>
  `${member.firstName} ${member.lastName}`.trim();


export type UserRole = 'admin' | 'staff';

export interface StaffAccount {
  id: string;
  username: string;
  passwordHash: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  role: 'Front Desk Staff' | 'Gym Trainer' | 'Shift Lead' | 'Assistant Manager';
  status: 'Active' | 'Pending' | 'Suspended';
  registeredAt: string;
  registeredBy: string;
  assignedShift?: string;
  permissions?: string[];
  notes?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  badge: string;
  email: string;
  permissions?: string[];
}

export const STAFF_PERMISSION_OPTIONS = [
  { id: 'checkin', labelEn: 'Check-In Desk', labelMn: 'Бүртгэлийн ширээ (Check-In)' },
  { id: 'locker', labelEn: 'Locker Usage & Logs', labelMn: 'Шүүгээний ашиглалт & Бүртгэл' },
  { id: 'registration', labelEn: 'Athlete & Org Registration', labelMn: 'Тамирчин & Байгууллага бүртгэх' },
  { id: 'directory', labelEn: 'Member Directory & Plan Extension', labelMn: 'Гишүүдийн сан & Багц сунгах' },
  { id: 'inventory', labelEn: 'Inventory View (Read-Only)', labelMn: 'Бараа, багц харах (Зөвхөн харах)' },
  { id: 'analytics', labelEn: 'Operational Analytics (Revenue Redacted)', labelMn: 'Үйл ажиллагааны статистик (Орлого хаалттай)' },
] as const;


export interface LockerLog {
  id: string;
  lockerNumber: string;
  memberId: string;
  memberName: string;
  eventType: 'Checked In' | 'Checked Out';
  eventDescription: string;
  timestamp: string;
  timeFormatted: string;
  statusLabel: 'Check-In Logged' | 'Key Returned';
  staffLogged: string;
  staffRole?: UserRole;
}

// MOCK_ Prefixed In-Memory Dataset Definitions (Pre-real-data state)
export const MOCK_BUILT_PLANS: BuiltPlan[] = [];
export const MOCK_GYM_MEMBERS: GymMember[] = [];
export const MOCK_LOCKER_LOGS: LockerLog[] = [];
export const MOCK_STAFF_ACCOUNTS: StaffAccount[] = [];

// Aliases for backward compatibility
export const DEFAULT_BUILT_PLANS = MOCK_BUILT_PLANS;
export const INITIAL_GYM_MEMBERS = MOCK_GYM_MEMBERS;
export const INITIAL_LOCKER_LOGS = MOCK_LOCKER_LOGS;
export const INITIAL_STAFF_ACCOUNTS = MOCK_STAFF_ACCOUNTS;

