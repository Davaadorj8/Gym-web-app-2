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

export type MemberStatus = 'Active' | 'Expired' | 'Suspended' | 'Pending' | 'Cancelled' | 'Refunded';
export type OccupancyStatus = 'Checked In' | 'Checked Out';

export type TransactionType = 'PAYMENT' | 'REFUND' | 'CREDIT_ADJUSTMENT';

export interface MembershipTransaction {
  id: string;
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
  status: LockerCustomStatus;
  updatedAt: string;
  notes?: string;
  updatedBy?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

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
  checkedInByStaffId?: string;
}

export type NutrientCategory = 'Supplements' | 'Shakes' | 'Beverages' | 'Snacks' | 'Vitamins';

export interface NutrientProduct {
  id: string;
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
export const MOCK_GYM_MEMBERS: GymMember[] = [];
export const MOCK_LOCKER_LOGS: LockerLog[] = [];
export const MOCK_STAFF_ACCOUNTS: StaffAccount[] = [];
export const MOCK_NUTRIENT_PRODUCTS: NutrientProduct[] = [
  { id: 'nutr-1', name: 'Whey Isolate Protein (1kg)', category: 'Supplements', price: 145000, stock: 24, flavor: 'Chocolate Fudge', bestBeforeDate: '2027-02-28' },
  { id: 'nutr-2', name: 'Pre-Workout Energy Blast', category: 'Supplements', price: 85000, stock: 15, flavor: 'Blue Raspberry', bestBeforeDate: '2026-09-12' },
  { id: 'nutr-3', name: 'Post-Workout Recovery Shake', category: 'Shakes', price: 15000, stock: 40, flavor: 'Vanilla Cream', bestBeforeDate: '2026-08-15' },
  { id: 'nutr-4', name: 'BCAA Electrolyte Powder', category: 'Beverages', price: 65000, stock: 18, flavor: 'Watermelon', bestBeforeDate: '2026-12-31' },
  { id: 'nutr-5', name: 'High Protein Bar (Box of 12)', category: 'Snacks', price: 48000, stock: 30, flavor: 'Peanut Butter', bestBeforeDate: '2026-09-02' },
  { id: 'nutr-6', name: 'Daily Multivitamin & Omega-3 Pack', category: 'Vitamins', price: 55000, stock: 12, bestBeforeDate: '2027-08-15' },
];
export const MOCK_NUTRIENT_SALES: NutrientSaleLog[] = [
  {
    id: 'sale-1',
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
  staffId: string;
  staffName: string;
  shiftId: string;
  clockInTime: string;
  clockOutTime?: string;
  status: 'ON_DUTY' | 'COMPLETED';
}

export interface Supplier {
  id: string;
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


