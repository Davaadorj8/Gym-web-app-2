export type CategoryTarget = 'under18' | 'over18' | 'organization';

export interface GymLocation {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

export const MOCK_LOCATIONS: GymLocation[] = [
  { id: 'loc-downtown', tenantId: 'tenant-arche', name: 'Downtown Flagship Branch', code: 'DT-01', address: 'Sukhbaatar Sq 5, Ulaanbaatar', phone: '7711-0001', status: 'Active' },
  { id: 'loc-uptown', tenantId: 'tenant-arche', name: 'Uptown Express Branch', code: 'UT-02', address: 'Khan-Uul District 11, Ulaanbaatar', phone: '7711-0002', status: 'Active' },
  { id: 'loc-westside', tenantId: 'tenant-arche', name: 'Westside Performance Branch', code: 'WS-03', address: 'Bayangol District 3, Ulaanbaatar', phone: '7711-0003', status: 'Active' },
];

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
}

export const getMemberFullName = (member: { firstName: string; lastName: string }): string =>
  `${member.firstName} ${member.lastName}`.trim();


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


export type LockerCustomStatus =
  | 'available'
  | 'occupied'
  | 'clean'
  | 'repair'
  | 'key_lost'
  | 'key_not_returned'
  | 'inactive';

export interface LockerStatusDetail {
  lockerNumber: string;
  tenantId?: string;
  locationId?: string;
  status: LockerCustomStatus;
  updatedAt: string;
  notes?: string;
  updatedBy?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface LockerLog {
  id: string;
  tenantId?: string;
  locationId?: string;
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
  checkedInByStaffId?: string;
}

export type NutrientCategory = 'Supplements' | 'Shakes' | 'Beverages' | 'Snacks' | 'Vitamins';

export interface NutrientProduct {
  id: string;
  tenantId?: string;
  locationId?: string;
  name: string;
  category: NutrientCategory;
  price: number;
  stock: number;
  servingSize?: string;
  flavor?: string;
  bestBeforeDate?: string;
}

export interface NutrientSaleLog {
  id: string;
  tenantId?: string;
  locationId?: string;
  productId: string;
  productName: string;
  category: NutrientCategory;
  quantity: number;
  unitPrice: number;
  unitPriceAtSale?: number;
  totalPrice: number;
  timestamp: string;
  timeFormatted: string;
  paymentMethod: string;
  memberId?: string;
  memberName?: string;
  buyerName?: string;
  staffLogged?: string;
  staffName?: string;
}

// MOCK_ Prefixed In-Memory Dataset Definitions (Pre-real-data state)
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
export const MOCK_LOCKER_LOGS: LockerLog[] = [];
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
export const MOCK_NUTRIENT_PRODUCTS: NutrientProduct[] = [
  { id: 'nutr-1', tenantId: 'tenant-arche', locationId: 'loc-downtown', name: 'Whey Isolate Protein (1kg)', category: 'Supplements', price: 145000, stock: 24, flavor: 'Chocolate Fudge', bestBeforeDate: '2027-02-28' },
  { id: 'nutr-2', tenantId: 'tenant-arche', locationId: 'loc-downtown', name: 'Pre-Workout Energy Blast', category: 'Supplements', price: 85000, stock: 15, flavor: 'Blue Raspberry', bestBeforeDate: '2026-09-12' },
  { id: 'nutr-3', tenantId: 'tenant-arche', locationId: 'loc-uptown', name: 'Post-Workout Recovery Shake', category: 'Shakes', price: 15000, stock: 40, flavor: 'Vanilla Cream', bestBeforeDate: '2026-08-15' },
  { id: 'nutr-4', tenantId: 'tenant-arche', locationId: 'loc-uptown', name: 'BCAA Electrolyte Powder', category: 'Beverages', price: 65000, stock: 18, flavor: 'Watermelon', bestBeforeDate: '2026-12-31' },
  { id: 'nutr-5', tenantId: 'tenant-arche', locationId: 'loc-westside', name: 'High Protein Bar (Box of 12)', category: 'Snacks', price: 48000, stock: 30, flavor: 'Peanut Butter', bestBeforeDate: '2026-09-02' },
  { id: 'nutr-6', tenantId: 'tenant-arche', locationId: 'loc-westside', name: 'Daily Multivitamin & Omega-3 Pack', category: 'Vitamins', price: 55000, stock: 12, bestBeforeDate: '2027-08-15' },
];
export const MOCK_NUTRIENT_SALES: NutrientSaleLog[] = [
  {
    id: 'sale-1',
    tenantId: 'tenant-arche',
    locationId: 'loc-downtown',
    productId: 'nutr-1',
    productName: 'Whey Isolate Protein (1kg)',
    category: 'Supplements',
    quantity: 2,
    unitPrice: 135000,
    totalPrice: 270000,
    timestamp: '2026-08-10T10:30:00.000Z',
    timeFormatted: '2026-08-10 10:30',
    paymentMethod: 'Card',
    memberName: 'Bataa Bold',
    staffLogged: 'Admin',
  },
  {
    id: 'sale-2',
    tenantId: 'tenant-arche',
    locationId: 'loc-uptown',
    productId: 'nutr-2',
    productName: 'Pre-Workout Energy Blast',
    category: 'Supplements',
    quantity: 1,
    unitPrice: 80000,
    totalPrice: 80000,
    timestamp: '2026-08-15T14:15:00.000Z',
    timeFormatted: '2026-08-15 14:15',
    paymentMethod: 'QPay',
    memberName: 'Tuya Ganbaatar',
    staffLogged: 'Front Desk Staff',
  },
  {
    id: 'sale-3',
    tenantId: 'tenant-arche',
    locationId: 'loc-downtown',
    productId: 'nutr-3',
    productName: 'Post-Workout Recovery Shake',
    category: 'Shakes',
    quantity: 5,
    unitPrice: 15000,
    totalPrice: 75000,
    timestamp: '2026-08-20T16:45:00.000Z',
    timeFormatted: '2026-08-20 16:45',
    paymentMethod: 'Cash',
    memberName: 'Anand Erdene',
    staffLogged: 'Admin',
  },
  {
    id: 'sale-4',
    tenantId: 'tenant-arche',
    locationId: 'loc-westside',
    productId: 'nutr-5',
    productName: 'High Protein Bar (Box of 12)',
    category: 'Snacks',
    quantity: 2,
    unitPrice: 45000,
    totalPrice: 90000,
    timestamp: '2026-08-22T11:00:00.000Z',
    timeFormatted: '2026-08-22 11:00',
    paymentMethod: 'QPay',
    memberName: 'Sarnai Dorj',
    staffLogged: 'Front Desk Staff',
  },
];

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

export interface Supplier {
  id: string;
  tenantId?: string;
  locationId?: string;
  name: string;
  contactEmail: string;
  phone: string;
  leadTimeDays: number;
}

export interface POItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPurchaseCost: number;
}

export interface PurchaseOrder {
  id: string;
  tenantId?: string;
  locationId?: string;
  supplierId: string;
  supplierName: string;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  items: POItem[];
  totalCost: number;
  createdAt: string;
  receivedAt?: string;
}

export interface StockIntakeLog {
  id: string;
  tenantId?: string;
  locationId?: string;
  purchaseOrderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPurchaseCost: number;
  unitSellingPrice: number;
  marginPercent: number;
  timestamp: string;
}

export interface WaitlistEntry {
  id: string;
  tenantId?: string;
  locationId?: string;
  resourceType: 'LOCKER' | 'GYM_FLOOR';
  memberId: string;
  memberName: string;
  joinedAt: string;
  status: 'WAITING' | 'OFFERED' | 'CLAIMED' | 'EXPIRED';
  offerExpiresAt?: string;
  offeredLockerNumber?: string;
}

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'Elite Nutrition LLC', contactEmail: 'orders@elitenutrition.mn', phone: '9911-2233', leadTimeDays: 3 },
  { id: 'sup-2', name: 'BioTech Organics', contactEmail: 'info@biotech.mn', phone: '9922-3344', leadTimeDays: 5 },
  { id: 'sup-3', name: 'Peak Performance Suppliers', contactEmail: 'supply@peakperf.mn', phone: '8811-0022', leadTimeDays: 2 },
];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1001',
    supplierId: 'sup-1',
    supplierName: 'Elite Nutrition LLC',
    status: 'RECEIVED',
    items: [
      { id: 'poi-1', productId: 'nutr-1', productName: 'Whey Isolate Protein (1kg)', quantity: 20, unitPurchaseCost: 95000 }
    ],
    totalCost: 1900000,
    createdAt: '2026-08-01T10:00:00.000Z',
    receivedAt: '2026-08-04T14:30:00.000Z'
  },
  {
    id: 'po-1002',
    supplierId: 'sup-2',
    supplierName: 'BioTech Organics',
    status: 'ORDERED',
    items: [
      { id: 'poi-2', productId: 'nutr-2', productName: 'Pre-Workout Energy Blast', quantity: 15, unitPurchaseCost: 55000 }
    ],
    totalCost: 825000,
    createdAt: '2026-08-25T09:00:00.000Z'
  }
];

export const MOCK_STOCK_INTAKES: StockIntakeLog[] = [
  {
    id: 'intake-1',
    purchaseOrderId: 'po-1001',
    productId: 'nutr-1',
    productName: 'Whey Isolate Protein (1kg)',
    quantity: 20,
    unitPurchaseCost: 95000,
    unitSellingPrice: 145000,
    marginPercent: 34.48,
    timestamp: '2026-08-04T14:30:00.000Z'
  }
];

// Aliases for backward compatibility
export const DEFAULT_BUILT_PLANS = MOCK_BUILT_PLANS;
export const INITIAL_GYM_MEMBERS = MOCK_GYM_MEMBERS;
export const INITIAL_LOCKER_LOGS = MOCK_LOCKER_LOGS;
export const INITIAL_STAFF_ACCOUNTS = MOCK_STAFF_ACCOUNTS;
export const INITIAL_NUTRIENT_PRODUCTS = MOCK_NUTRIENT_PRODUCTS;
export const INITIAL_NUTRIENT_SALES = MOCK_NUTRIENT_SALES;


