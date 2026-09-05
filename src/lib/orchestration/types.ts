import {
  AuthUser,
  BuiltPlan,
  GymMember,
  GymLocation,
  UserRole,
} from '@/lib/types';
import { LockerLog, LockerCustomStatus, WaitlistEntry } from '@/features/lockers';
import { StaffAccount, StaffAttendance } from '@/features/staff';
import { NutrientProduct, NutrientSaleLog, Supplier, PurchaseOrder, POItem, StockIntakeLog } from '@/features/inventory';
import { TenantQueryContext } from '@/server/repositories/types';

export interface DashboardContextValue {
  // Multi-Tenant & Location Context
  tenantId: string;
  locations: GymLocation[];
  selectedLocationId: string;
  tenantContext: TenantQueryContext;
  setSelectedLocationId: (locationId: string) => void;

  // State
  isAuthenticated: boolean;
  currentUser: AuthUser;
  activeTab: string;
  mobileMenuOpen: boolean;
  sidebarCollapsed: boolean;
  members: GymMember[];
  plans: BuiltPlan[];
  lockerLogs: LockerLog[];
  staffList: StaffAccount[];
  totalLockers: number;
  lockerStatuses: Record<string, LockerCustomStatus>;
  nutrients: NutrientProduct[];
  nutrientSales: NutrientSaleLog[];
  isLoading: boolean;
  statusMessage: string | null;
  directoryFilter: string;

  // Phase 3 States
  attendances: StaffAttendance[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  stockIntakes: StockIntakeLog[];
  waitlist: WaitlistEntry[];
  maxGymCapacity: number;

  // Setters / UI Actions
  setActiveTab: (tab: string) => void;
  setDirectoryFilter: (filter: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  setStatusMessage: (msg: string | null) => void;
  login: (identifier: string, password?: string, loginRole?: UserRole, locale?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  setMaxGymCapacity: (capacity: number) => void;

  // Domain Actions
  updateMember: (member: GymMember) => void;
  registerMember: (member: GymMember) => void;
  deleteMember: (id: string) => void;
  extendMember: (
    memberId: string,
    monthsAdded: number,
    feePaid: number,
    paymentMethod: string,
    newExpirationDate?: string
  ) => void;
  checkInMember: (memberId: string, lockerNumber: string, processedByStaffId?: string) => void;
  checkOutMember: (memberId: string) => void;
  cancelAndRefundMember: (
    memberId: string,
    refundType: 'FULL' | 'PRORATED' | 'CREDIT' | 'MANUAL',
    manualAmount?: number,
    notes?: string
  ) => Promise<void>;
  evaluateMembershipStatuses: () => Promise<{ updatedToExpired: number; updatedToActive: number }>;
  addPlan: (plan: BuiltPlan) => void;
  deletePlan: (id: string) => void;
  saveTotalLockers: (count: number) => void;
  updateLockerStatus: (lockerNumber: string, status: LockerCustomStatus, notes?: string) => void;
  logLockerEvent: (event: {
    lockerNumber: string;
    memberId: string;
    memberName: string;
    eventType: 'Checked In' | 'Checked Out';
    eventDescription: string;
    statusLabel: 'Check-In Logged' | 'Key Returned';
    staffLogged?: string;
    staffRole?: UserRole;
    checkedInByStaffId?: string;
  }) => void;
  addStaff: (input: {
    username: string;
    password: string;
    fullName: string;
    email?: string;
    phoneNumber?: string;
    role: StaffAccount['role'];
    assignedShift?: string;
    status: 'Active' | 'Pending';
    notes?: string;
    permissions?: string[];
  }) => Promise<{ staff: StaffAccount | null; error?: string }>;
  updateStaff: (staff: StaffAccount) => void;
  deleteStaff: (id: string) => void;
  resetStaffPassword: (id: string, newPassword: string) => Promise<boolean>;
  addNutrient: (product: NutrientProduct) => void;
  deleteNutrient: (id: string) => void;
  updateNutrient: (product: NutrientProduct) => void;
  updateNutrientPrice: (id: string, newPrice: number) => void;
  recordNutrientSale: (sale: Omit<NutrientSaleLog, 'id' | 'timestamp' | 'timeFormatted'>) => void;

  // Phase 3 Actions
  clockIn: (staffId: string, shiftId: string) => void;
  clockOut: (attendanceId: string) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  createPurchaseOrder: (input: {
    supplierId: string;
    supplierName: string;
    items: Omit<POItem, 'id'>[];
  }) => Promise<PurchaseOrder | null>;
  receivePurchaseOrder: (id: string) => void;
  cancelPurchaseOrder: (id: string) => void;
  joinWaitlist: (resourceType: 'LOCKER' | 'GYM_FLOOR', memberId: string, memberName: string) => void;
  leaveWaitlist: (id: string) => void;
  claimWaitlistOffer: (id: string) => void;
}

export const DEFAULT_ADMIN_USER: AuthUser = {
  id: 'usr-admin',
  name: 'Arche Owner',
  role: 'admin',
  roleTitle: 'Owner (Admin)',
  badge: 'Admin',
  email: 'admin@archegym.com',
};
