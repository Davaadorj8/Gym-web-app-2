export type UserRole = 'admin' | 'staff';

export interface StaffAccount {
  id: string;
  tenantId?: string;
  locationId?: string;
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
  plainTextPasswordForDemo?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface AuthUser {
  id: string;
  tenantId?: string;
  locationId?: string;
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

export interface StaffAttendance {
  id: string;
  tenantId?: string;
  locationId?: string;
  staffId: string;
  staffName: string;
  shiftId: string;
  clockInTime: string;
  clockOutTime?: string;
  status: 'ON_DUTY' | 'COMPLETED';
}

export const MOCK_STAFF_ACCOUNTS: StaffAccount[] = [
  {
    id: 'staff-1',
    tenantId: 'tenant-arche',
    locationId: 'loc-downtown',
    username: 'staff_downtown',
    passwordHash: 'password123',
    fullName: 'Bat-Erdene FrontDesk (Downtown)',
    email: 'downtown.staff@archegym.com',
    role: 'Front Desk Staff',
    status: 'Active',
    registeredAt: '2026-01-01T08:00:00.000Z',
    registeredBy: 'Admin',
    assignedShift: 'Morning (07:00 - 15:00)',
  },
  {
    id: 'staff-2',
    tenantId: 'tenant-arche',
    locationId: 'loc-uptown',
    username: 'staff_uptown',
    passwordHash: 'password123',
    fullName: 'Khulan ShiftLead (Uptown)',
    email: 'uptown.staff@archegym.com',
    role: 'Shift Lead',
    status: 'Active',
    registeredAt: '2026-02-15T08:00:00.000Z',
    registeredBy: 'Admin',
    assignedShift: 'Evening (15:00 - 23:00)',
  },
  {
    id: 'staff-3',
    tenantId: 'tenant-arche',
    locationId: 'loc-westside',
    username: 'staff_westside',
    passwordHash: 'password123',
    fullName: 'Temuulen Trainer (Westside)',
    email: 'westside.staff@archegym.com',
    role: 'Gym Trainer',
    status: 'Active',
    registeredAt: '2026-03-10T08:00:00.000Z',
    registeredBy: 'Admin',
    assignedShift: 'Full Day (09:00 - 18:00)',
  },
];
