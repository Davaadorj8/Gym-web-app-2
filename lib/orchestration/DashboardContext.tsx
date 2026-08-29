'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  AuthUser,
  BuiltPlan,
  DEFAULT_BUILT_PLANS,
  GymMember,
  INITIAL_GYM_MEMBERS,
  INITIAL_LOCKER_LOGS,
  INITIAL_STAFF_ACCOUNTS,
  LockerLog,
  LockerCustomStatus,
  MembershipExtensionLog,
  NutrientProduct,
  MOCK_NUTRIENT_PRODUCTS,
  NutrientSaleLog,
  INITIAL_NUTRIENT_SALES,
  StaffAccount,
  UserRole,
} from '@/lib/types';
import {
  computeNewExpirationDate,
  formatLockerNumber,
  generateLockerList,
  getNextAvailableLocker,
  getOccupiedLockers,
  resolveMemberCategory,
  DEFAULT_STAFF_PERMISSIONS,
} from '@/lib/services';
import { format } from 'date-fns';
import { verifyPassword } from '@/lib/security/password';

export interface DashboardContextValue {
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

  // Setters / UI Actions
  setActiveTab: (tab: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  setStatusMessage: (msg: string | null) => void;
  login: (identifier: string, password?: string, loginRole?: UserRole, locale?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;

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
  checkInMember: (memberId: string, lockerNumber: string) => void;
  checkOutMember: (memberId: string) => void;
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
  }) => void;
  addStaff: (staff: StaffAccount) => void;
  updateStaff: (staff: StaffAccount) => void;
  deleteStaff: (id: string) => void;
  addNutrient: (product: NutrientProduct) => void;
  deleteNutrient: (id: string) => void;
  updateNutrient: (product: NutrientProduct) => void;
  updateNutrientPrice: (id: string, newPrice: number) => void;
  recordNutrientSale: (sale: Omit<NutrientSaleLog, 'id' | 'timestamp' | 'timeFormatted'>) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export const DEFAULT_ADMIN_USER: AuthUser = {
  id: 'usr-admin',
  name: 'Arche Owner',
  role: 'admin',
  roleTitle: 'Owner (Admin)',
  badge: 'Admin',
  email: 'admin@archegym.com',
};

export function DashboardProvider({
  children,
  initialMembers = INITIAL_GYM_MEMBERS,
  initialPlans = DEFAULT_BUILT_PLANS,
  initialLockerLogs = INITIAL_LOCKER_LOGS,
  initialStaff = INITIAL_STAFF_ACCOUNTS,
  initialTotalLockers = 60,
  initialUser = DEFAULT_ADMIN_USER,
  initialAuthenticated = false,
}: {
  children: React.ReactNode;
  initialMembers?: GymMember[];
  initialPlans?: BuiltPlan[];
  initialLockerLogs?: LockerLog[];
  initialStaff?: StaffAccount[];
  initialTotalLockers?: number;
  initialUser?: AuthUser;
  initialAuthenticated?: boolean;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAuthenticated);
  const [currentUser, setCurrentUser] = useState<AuthUser>(initialUser);
  const [activeTab, setActiveTab] = useState<string>('directory');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  // Core domain data collections
  const [members, setMembers] = useState<GymMember[]>(initialMembers);
  const [plans, setPlans] = useState<BuiltPlan[]>(initialPlans);
  const [lockerLogs, setLockerLogs] = useState<LockerLog[]>(initialLockerLogs);
  const [staffList, setStaffList] = useState<StaffAccount[]>(initialStaff);
  const [totalLockers, setTotalLockers] = useState<number>(initialTotalLockers);
  const [lockerStatuses, setLockerStatuses] = useState<Record<string, LockerCustomStatus>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('arche_locker_custom_statuses');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {};
  });

  const [nutrients, setNutrients] = useState<NutrientProduct[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('arche_nutrient_products');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return MOCK_NUTRIENT_PRODUCTS;
  });

  const [nutrientSales, setNutrientSales] = useState<NutrientSaleLog[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('arche_nutrient_sales');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return INITIAL_NUTRIENT_SALES;
  });

  // Authentication handlers
  const login = useCallback(
    async (
      identifier: string,
      password?: string,
      loginRole: UserRole = 'admin',
      locale: string = 'en'
    ) => {
      setIsLoading(true);
      setStatusMessage(null);

      const cleanInput = identifier.trim().toLowerCase();

      const matchedStaff = staffList.find(
        (s) =>
          s.username.toLowerCase() === cleanInput ||
          (s.email && s.email.toLowerCase() === cleanInput)
      );

      if (matchedStaff) {
        if (matchedStaff.status === 'Suspended') {
          setStatusMessage(
            locale === 'mn'
              ? 'Энэ ажилтны эрх түдгэлзсэн байна.'
              : 'This staff account has been suspended.'
          );
          setIsLoading(false);
          return;
        }

        if (password && matchedStaff.passwordHash) {
          // Verify with bcrypt, fall back to plain text comparison if password is not hashed
          let isValid = false;
          try {
            isValid = await verifyPassword(password, matchedStaff.passwordHash);
          } catch {
            isValid = password === matchedStaff.passwordHash;
          }

          if (!isValid && password !== matchedStaff.passwordHash) {
            setStatusMessage(
              locale === 'mn' ? 'Нууц үг тохирохгүй байна.' : 'Invalid password provided.'
            );
            setIsLoading(false);
            return;
          }
        }

        setCurrentUser({
          id: matchedStaff.id,
          name: matchedStaff.fullName,
          role: 'staff',
          roleTitle: matchedStaff.role || 'Front Desk Staff',
          badge: 'Staff',
          email: matchedStaff.email || `${matchedStaff.username}@archegym.com`,
          permissions:
            matchedStaff.permissions && matchedStaff.permissions.length > 0
              ? matchedStaff.permissions
              : DEFAULT_STAFF_PERMISSIONS,
        });

        setTimeout(() => {
          setIsLoading(false);
          setIsAuthenticated(true);
        }, 400);
        return;
      }

      const isStaff =
        loginRole === 'staff' ||
        cleanInput.includes('staff') ||
        cleanInput.includes('reception');
      const effectiveRole: UserRole = isStaff ? 'staff' : 'admin';
      const rawName = identifier.trim()
        ? identifier.includes('@')
          ? identifier.split('@')[0].replace('.', ' ')
          : identifier
        : effectiveRole === 'admin'
        ? 'Arche Owner'
        : 'Reception Staff';
      const effectiveName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      setCurrentUser({
        id: `usr-${effectiveRole}-${Date.now()}`,
        name: effectiveName,
        role: effectiveRole,
        roleTitle: effectiveRole === 'admin' ? 'Owner (Admin)' : 'Front Desk Staff',
        badge: effectiveRole === 'admin' ? 'Admin' : 'Staff',
        email:
          identifier ||
          (effectiveRole === 'admin' ? 'admin@archegym.com' : 'staff@archegym.com'),
        permissions: effectiveRole === 'staff' ? DEFAULT_STAFF_PERMISSIONS : undefined,
      });

      setTimeout(() => {
        setIsLoading(false);
        setIsAuthenticated(true);
      }, 400);
    },
    [staffList]
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setStatusMessage(null);
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role: newRole,
      badge: newRole === 'admin' ? 'Admin' : 'Staff',
      roleTitle: newRole === 'admin' ? 'Owner (Admin)' : 'Front Desk Staff',
      name: newRole === 'admin' ? 'Arche Owner' : 'Reception Staff',
      email: newRole === 'admin' ? 'admin@archegym.com' : 'staff@archegym.com',
      permissions:
        newRole === 'staff'
          ? prev.permissions && prev.permissions.length > 0
            ? prev.permissions
            : DEFAULT_STAFF_PERMISSIONS
          : undefined,
    }));
    if (newRole === 'staff') {
      setActiveTab((prevTab) => (prevTab === 'approvals' ? 'directory' : prevTab));
    }
  }, []);

  // Locker Log Event Emitter
  const logLockerEvent = useCallback(
    (event: {
      lockerNumber: string;
      memberId: string;
      memberName: string;
      eventType: 'Checked In' | 'Checked Out';
      eventDescription: string;
      statusLabel: 'Check-In Logged' | 'Key Returned';
      staffLogged?: string;
      staffRole?: UserRole;
    }) => {
      const now = new Date();
      const timeFormatted = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const staffBadge = event.staffLogged || (currentUser.role === 'admin' ? 'Admin' : 'Staff');

      const newLog: LockerLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        lockerNumber: event.lockerNumber,
        memberId: event.memberId,
        memberName: event.memberName,
        eventType: event.eventType,
        eventDescription: event.eventDescription,
        timestamp: now.toISOString(),
        timeFormatted,
        statusLabel: event.statusLabel,
        staffLogged: staffBadge,
        staffRole: event.staffRole || currentUser.role,
      };

      setLockerLogs((prev) => [newLog, ...prev]);
    },
    [currentUser]
  );

  // Member Domain Actions
  const updateMember = useCallback((updatedMember: GymMember) => {
    setMembers((prev) => prev.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
  }, []);

  const registerMember = useCallback((newMember: GymMember) => {
    setMembers((prev) => [newMember, ...prev]);
  }, []);

  const deleteMember = useCallback((memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }, []);

  const extendMember = useCallback(
    (
      memberId: string,
      monthsAdded: number,
      feePaid: number,
      paymentMethod: string,
      customExpirationDate?: string
    ) => {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== memberId) return m;

          const newExpDate =
            customExpirationDate || computeNewExpirationDate(m.expirationDate, monthsAdded);
          const now = new Date();
          const timeFormatted = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          const extensionLog: MembershipExtensionLog = {
            id: `ext-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            extendedAt: format(now, 'yyyy-MM-dd'),
            timeFormatted,
            monthsAdded,
            previousExpirationDate: m.expirationDate,
            newExpirationDate: newExpDate,
            staffLogged: currentUser.name || (currentUser.role === 'admin' ? 'Admin' : 'Staff'),
            feePaid,
            paymentMethod,
            memberCategory: resolveMemberCategory(m),
            memberId: m.id,
            memberName: `${m.firstName} ${m.lastName}`.trim(),
          };

          return {
            ...m,
            durationMonths: (m.durationMonths || 1) + monthsAdded,
            expirationDate: newExpDate,
            status: 'Active',
            extensionHistory: [extensionLog, ...(m.extensionHistory || [])],
          };
        })
      );
    },
    [currentUser]
  );

  const checkInMember = useCallback(
    (memberId: string, lockerNumber: string) => {
      const now = new Date();
      const nowFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== memberId) return m;
          const updated: GymMember = {
            ...m,
            occupancyStatus: 'Checked In',
            assignedLocker: lockerNumber,
            lastCheckInTime: now.toISOString(),
          };
          return updated;
        })
      );

      const target = members.find((m) => m.id === memberId);
      const memberName = target ? `${target.firstName} ${target.lastName}`.trim() : 'Member';

      logLockerEvent({
        lockerNumber,
        memberId,
        memberName,
        eventType: 'Checked In',
        eventDescription: `Check-in recorded, ${lockerNumber} assigned at ${nowFormatted}`,
        statusLabel: 'Check-In Logged',
        staffLogged: currentUser.role === 'admin' ? 'Admin' : 'Staff',
        staffRole: currentUser.role,
      });
    },
    [members, logLockerEvent, currentUser]
  );

  const checkOutMember = useCallback(
    (memberId: string) => {
      const target = members.find((m) => m.id === memberId);
      if (!target) return;

      const releasedLocker = target.assignedLocker || 'Locker Key';
      const nowFormatted = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== memberId) return m;
          return {
            ...m,
            occupancyStatus: 'Checked Out',
            assignedLocker: null,
          };
        })
      );

      logLockerEvent({
        lockerNumber: releasedLocker,
        memberId: target.id,
        memberName: `${target.firstName} ${target.lastName}`.trim(),
        eventType: 'Checked Out',
        eventDescription: `Key returned, ${releasedLocker} freed at ${nowFormatted}`,
        statusLabel: 'Key Returned',
        staffLogged: currentUser.role === 'admin' ? 'Admin' : 'Staff',
        staffRole: currentUser.role,
      });
    },
    [members, logLockerEvent, currentUser]
  );

  // Plan Domain Actions
  const addPlan = useCallback((newPlan: BuiltPlan) => {
    setPlans((prev) => [newPlan, ...prev]);
  }, []);

  const deletePlan = useCallback((id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const saveTotalLockers = useCallback((count: number) => {
    setTotalLockers(Math.max(1, count));
  }, []);

  const updateLockerStatus = useCallback(
    (lockerNumber: string, status: LockerCustomStatus, notes?: string) => {
      setLockerStatuses((prev) => {
        const updated = { ...prev, [lockerNumber]: status };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('arche_locker_custom_statuses', JSON.stringify(updated));
          } catch {
            // ignore
          }
        }
        return updated;
      });

      const now = new Date();
      const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const statusLabels: Record<LockerCustomStatus, string> = {
        clean: 'Marked Clean',
        repair: 'Needs Repair / Fix',
        key_lost: 'Key Reported Lost',
        key_not_returned: 'Key Overdue / Not Returned',
        inactive: 'Deactivated / Inactive',
        available: 'Set Available',
        occupied: 'Occupied',
      };

      logLockerEvent({
        lockerNumber,
        memberId: 'SYSTEM',
        memberName: 'Staff Action',
        eventType: 'Checked Out',
        eventDescription: `Status updated to [${statusLabels[status] || status}]${notes ? `: ${notes}` : ''} at ${timeFormatted}`,
        statusLabel: 'Key Returned',
        staffLogged: currentUser.name || (currentUser.role === 'admin' ? 'Admin' : 'Staff'),
        staffRole: currentUser.role,
      });
    },
    [currentUser, logLockerEvent]
  );

  // Staff Domain Actions
  const addStaff = useCallback((newStaff: StaffAccount) => {
    setStaffList((prev) => [newStaff, ...prev]);
  }, []);

  const updateStaff = useCallback((updatedStaff: StaffAccount) => {
    setStaffList((prev) => prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s)));
  }, []);

  const deleteStaff = useCallback((id: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Nutrient Inventory Actions
  const addNutrient = useCallback((newProduct: NutrientProduct) => {
    setNutrients((prev) => {
      const updated = [newProduct, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('arche_nutrient_products', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  }, []);

  const deleteNutrient = useCallback((id: string) => {
    setNutrients((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('arche_nutrient_products', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  }, []);

  const updateNutrient = useCallback((updatedProduct: NutrientProduct) => {
    setNutrients((prev) => {
      const updated = prev.map((n) => (n.id === updatedProduct.id ? updatedProduct : n));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('arche_nutrient_products', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  }, []);

  const updateNutrientPrice = useCallback((id: string, newPrice: number) => {
    setNutrients((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, price: Math.max(0, newPrice) } : n));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('arche_nutrient_products', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  }, []);

  const recordNutrientSale = useCallback(
    (saleData: Omit<NutrientSaleLog, 'id' | 'timestamp' | 'timeFormatted'>) => {
      const now = new Date();
      const newSale: NutrientSaleLog = {
        ...saleData,
        id: `sale-${Date.now()}`,
        timestamp: now.toISOString(),
        timeFormatted: format(now, 'yyyy-MM-dd HH:mm'),
      };

      setNutrientSales((prev) => {
        const updated = [newSale, ...prev];
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('arche_nutrient_sales', JSON.stringify(updated));
          } catch {
            // ignore
          }
        }
        return updated;
      });

      // Automatically decrement product stock
      setNutrients((prev) => {
        const updated = prev.map((n) => {
          if (n.id === saleData.productId) {
            return { ...n, stock: Math.max(0, n.stock - saleData.quantity) };
          }
          return n;
        });
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('arche_nutrient_products', JSON.stringify(updated));
          } catch {
            // ignore
          }
        }
        return updated;
      });
    },
    []
  );

  const value = useMemo<DashboardContextValue>(
    () => ({
      isAuthenticated,
      currentUser,
      activeTab,
      mobileMenuOpen,
      sidebarCollapsed,
      members,
      plans,
      lockerLogs,
      staffList,
      totalLockers,
      lockerStatuses,
      nutrients,
      nutrientSales,
      isLoading,
      statusMessage,
      setActiveTab,
      setMobileMenuOpen,
      setSidebarCollapsed,
      toggleSidebar,
      setStatusMessage,
      login,
      logout,
      switchRole,
      updateMember,
      registerMember,
      deleteMember,
      extendMember,
      checkInMember,
      checkOutMember,
      addPlan,
      deletePlan,
      saveTotalLockers,
      updateLockerStatus,
      logLockerEvent,
      addStaff,
      updateStaff,
      deleteStaff,
      addNutrient,
      deleteNutrient,
      updateNutrient,
      updateNutrientPrice,
      recordNutrientSale,
    }),
    [
      isAuthenticated,
      currentUser,
      activeTab,
      mobileMenuOpen,
      sidebarCollapsed,
      members,
      plans,
      lockerLogs,
      staffList,
      totalLockers,
      lockerStatuses,
      nutrients,
      nutrientSales,
      isLoading,
      statusMessage,
      toggleSidebar,
      login,
      logout,
      switchRole,
      updateMember,
      registerMember,
      deleteMember,
      extendMember,
      checkInMember,
      checkOutMember,
      addPlan,
      deletePlan,
      saveTotalLockers,
      updateLockerStatus,
      logLockerEvent,
      addStaff,
      updateStaff,
      deleteStaff,
      addNutrient,
      deleteNutrient,
      updateNutrient,
      updateNutrientPrice,
      recordNutrientSale,
    ]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardContextValue {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
