'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut as nextAuthSignOut, signIn as nextAuthSignIn } from 'next-auth/react';
import {
  AuthUser,
  BuiltPlan,
  CategoryTarget,
  DEFAULT_BUILT_PLANS,
  GymMember,
  GymLocation,
  MOCK_LOCATIONS,
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
  StaffAttendance,
  Supplier,
  PurchaseOrder,
  StockIntakeLog,
  WaitlistEntry,
  MOCK_SUPPLIERS,
  MOCK_PURCHASE_ORDERS,
  MOCK_STOCK_INTAKES,
} from '@/lib/types';
import { TenantQueryContext } from '@/server/repositories/types';
import {
  computeNewExpirationDate,
  formatLockerNumber,
  generateLockerList,
  getNextAvailableLocker,
  getOccupiedLockers,
  resolveMemberCategory,
  DEFAULT_STAFF_PERMISSIONS,
  PricingService,
} from '@/lib/services';
import { MembershipStatusService, RefundService } from '@/server/services';
import { getMemberRepository, getMembershipTransactionRepository } from '@/server/repositories';
import { format } from 'date-fns';
import { createAuditEntry } from '@/lib/utils/audit';

import { DashboardContextValue, DEFAULT_ADMIN_USER } from './types';

const DashboardContext = createContext<DashboardContextValue | null>(null);

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
  const { data: session, status } = useSession();
  const isAuthenticated = (status === 'authenticated' && !!session?.user) || (status !== 'loading');
  const [roleOverride, setRoleOverride] = useState<UserRole | null>(null);

  const currentUser: AuthUser = useMemo(() => {
    if (session?.user) {
      const rawRole = (session.user as { role?: string })?.role?.toLowerCase();
      const sessionRole: UserRole = rawRole === 'staff' ? 'staff' : 'admin';
      const effectiveRole: UserRole = roleOverride ?? sessionRole;
      return {
        id: session.user.id || 'usr-session',
        name: session.user.name || (effectiveRole === 'admin' ? 'Arche Owner' : 'Reception Staff'),
        role: effectiveRole,
        roleTitle: effectiveRole === 'admin' ? 'Owner (Admin)' : 'Front Desk Staff',
        badge: effectiveRole === 'admin' ? 'Admin' : 'Staff',
        email: session.user.email || (effectiveRole === 'admin' ? 'admin@archegym.com' : 'staff@archegym.com'),
        permissions: (session.user as { permissions?: string[] })?.permissions || (effectiveRole === 'staff' ? DEFAULT_STAFF_PERMISSIONS : undefined),
      };
    }
    const effectiveRole: UserRole = roleOverride ?? (initialUser?.role || (initialAuthenticated ? 'admin' : 'admin'));
    return {
      ...(initialUser || DEFAULT_ADMIN_USER),
      role: effectiveRole,
      roleTitle: effectiveRole === 'admin' ? 'Owner (Admin)' : 'Front Desk Staff',
      badge: effectiveRole === 'admin' ? 'Admin' : 'Staff',
      permissions: effectiveRole === 'staff' ? DEFAULT_STAFF_PERMISSIONS : undefined,
    };
  }, [session, roleOverride, initialUser, initialAuthenticated]);

  const [activeTab, setActiveTabState] = useState<string>('directory');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [directoryFilter, setDirectoryFilter] = useState<string>('all');

  const router = useRouter();
  const pathname = usePathname();

  const routeTab = pathname && pathname.startsWith('/dashboard/') ? pathname.split('/')[2] : null;
  const [prevRouteTab, setPrevRouteTab] = useState<string | null>(null);

  if (routeTab && routeTab !== prevRouteTab) {
    setPrevRouteTab(routeTab);
    if (routeTab !== activeTab) {
      setActiveTabState(routeTab);
    }
  }

  const setActiveTab = useCallback(
    (tab: string) => {
      setActiveTabState(tab);
      if (typeof window !== 'undefined') {
        const targetPath = `/dashboard/${tab}`;
        if (window.location.pathname !== targetPath) {
          router.push(targetPath);
        }
      }
    },
    [router]
  );

  // Phase 4 Multi-Tenancy & Multi-Location Scaling
  const [tenantId] = useState<string>('tenant-arche');
  const [locations] = useState<GymLocation[]>(MOCK_LOCATIONS);
  const [selectedLocationId, setSelectedLocationIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('arche_selected_location_id');
        if (saved) return saved;
      } catch {}
    }
    return 'loc-downtown';
  });

  const setSelectedLocationId = useCallback((locId: string) => {
    setSelectedLocationIdState(locId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arche_selected_location_id', locId);
    }
  }, []);

  const tenantContext = useMemo<TenantQueryContext>(() => ({
    tenantId,
    locationId: selectedLocationId,
  }), [tenantId, selectedLocationId]);

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

  // Phase 3 States
  const [attendances, setAttendances] = useState<StaffAttendance[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('arche_staff_attendances');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('arche_suppliers');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return MOCK_SUPPLIERS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('arche_purchase_orders');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return MOCK_PURCHASE_ORDERS;
  });

  const [stockIntakes, setStockIntakes] = useState<StockIntakeLog[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('arche_stock_intakes');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return MOCK_STOCK_INTAKES;
  });

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('arche_waitlist');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const [maxGymCapacity, setMaxGymCapacityState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('arche_max_gym_capacity');
        if (saved) return Number(saved) || 40;
      } catch {}
    }
    return 40;
  });

  const setMaxGymCapacity = useCallback((cap: number) => {
    const val = Math.max(1, cap);
    setMaxGymCapacityState(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arche_max_gym_capacity', String(val));
    }
  }, []);

  // Authentication handlers
  const login = useCallback(
    async (
      identifier: string,
      password?: string,
      _loginRole: UserRole = 'admin',
      _locale: string = 'en'
    ) => {
      setIsLoading(true);
      setStatusMessage(null);

      try {
        const res = await nextAuthSignIn('credentials', {
          email: identifier,
          password: password || '',
          redirect: false,
        });

        if (res?.error) {
          setStatusMessage('Invalid credentials provided.');
        } else {
          router.push(`/dashboard/${activeTab || 'directory'}`);
          router.refresh();
        }
      } catch {
        setStatusMessage('An error occurred during authentication.');
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, router]
  );

  const logout = useCallback(async () => {
    setStatusMessage(null);
    setRoleOverride(null);
    await nextAuthSignOut({ callbackUrl: '/login' });
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    setRoleOverride(newRole);
    if (newRole === 'staff') {
      setActiveTabState((prevTab) => (prevTab === 'approvals' || prevTab === 'inventory' ? 'directory' : prevTab));
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
      checkedInByStaffId?: string;
    }) => {
      const staffBadge = event.staffLogged || (currentUser.role === 'admin' ? 'Admin' : 'Staff');
      const audit = createAuditEntry('LOCKER_EVENT', event.lockerNumber, {
        memberId: event.memberId,
        memberName: event.memberName,
        eventType: event.eventType,
        eventDescription: event.eventDescription,
        statusLabel: event.statusLabel,
        staffLogged: staffBadge,
        staffRole: event.staffRole || currentUser.role,
        checkedInByStaffId: event.checkedInByStaffId,
      }, currentUser.id);

      const now = new Date(audit.timestamp);
      const timeFormatted = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const newLog: LockerLog = {
        id: audit.id,
        lockerNumber: event.lockerNumber,
        memberId: event.memberId,
        memberName: event.memberName,
        eventType: event.eventType,
        eventDescription: event.eventDescription,
        timestamp: audit.timestamp,
        timeFormatted,
        statusLabel: event.statusLabel,
        staffLogged: staffBadge,
        staffRole: event.staffRole || currentUser.role,
        checkedInByStaffId: event.checkedInByStaffId,
      };

      setLockerLogs((prev) => [newLog, ...prev]);
    },
    [currentUser]
  );

  // Member Domain Actions
  const updateMember = useCallback((updatedMember: GymMember) => {
    getMemberRepository().update(tenantContext, updatedMember.id, updatedMember);
    setMembers((prev) => prev.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
  }, [tenantContext]);

  const registerMember = useCallback((newMember: GymMember) => {
    getMemberRepository().create(tenantContext, newMember);
    setMembers((prev) => [newMember, ...prev]);
  }, [tenantContext]);

  const deleteMember = useCallback((memberId: string) => {
    getMemberRepository().delete(tenantContext, memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }, [tenantContext]);

  const cancelAndRefundMember = useCallback(
    async (
      memberId: string,
      refundType: 'FULL' | 'PRORATED' | 'CREDIT' | 'MANUAL',
      manualAmount?: number,
      notes?: string
    ) => {
      setIsLoading(true);
      try {
        const result = await RefundService.cancelAndRefund(memberId, refundType, {
          manualAmount,
          staffName: currentUser.name || 'Admin',
          notes,
        });
        
        // Update local state
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? result.member : m))
        );
        
        setStatusMessage(
          `Successfully processed ${refundType} cancellation. Refunded ${result.refundAmount.toLocaleString()} MNT.`
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          setStatusMessage(`Error during cancellation: ${err.message}`);
        } else {
          setStatusMessage(`Error during cancellation`);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  const evaluateMembershipStatuses = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await MembershipStatusService.evaluateMembershipStatuses();
      
      // Reload members from repository to get updated statuses
      const memberRepo = getMemberRepository();
      const updatedMembers = await memberRepo.findAll();
      setMembers(updatedMembers);
      
      setStatusMessage(
        `Daily check completed: ${result.updatedToExpired} expired, ${result.updatedToActive} reactivated.`
      );
      return result;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatusMessage(`Error during evaluation: ${err.message}`);
      } else {
        setStatusMessage(`Error during evaluation`);
      }
      return { updatedToExpired: 0, updatedToActive: 0 };
    } finally {
      setIsLoading(false);
    }
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

          const audit = createAuditEntry('MEMBERSHIP_EXTENSION', m.id, {
            monthsAdded,
            previousExpirationDate: m.expirationDate,
            newExpirationDate: newExpDate,
            staffLogged: currentUser.name || (currentUser.role === 'admin' ? 'Admin' : 'Staff'),
            feePaid,
            paymentMethod,
            memberCategory: resolveMemberCategory(m),
            memberName: `${m.firstName} ${m.lastName}`.trim(),
          }, currentUser.id);

          const now = new Date(audit.timestamp);
          const timeFormatted = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          const extensionLog: MembershipExtensionLog = {
            id: audit.id,
            extendedAt: format(now, 'yyyy-MM-dd'),
            timeFormatted,
            monthsAdded,
            previousExpirationDate: m.expirationDate,
            newExpirationDate: newExpDate,
            staffLogged: audit.details.staffLogged as string,
            feePaid,
            paymentMethod,
            memberCategory: audit.details.memberCategory as CategoryTarget,
            memberId: m.id,
            memberName: audit.details.memberName as string,
          };

          const updated: GymMember = {
            ...m,
            durationMonths: (m.durationMonths || 1) + monthsAdded,
            expirationDate: newExpDate,
            status: 'Active',
            extensionHistory: [extensionLog, ...(m.extensionHistory || [])],
          };

          getMemberRepository().update(tenantContext, memberId, updated);
          return updated;
        })
      );
    },
    [currentUser, tenantContext]
  );

  const checkInMember = useCallback(
    (memberId: string, lockerNumber: string, processedByStaffId?: string) => {
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

      const finalStaffId = processedByStaffId || currentUser.id;
      const staffAccount = staffList.find((s) => s.id === finalStaffId);
      const staffName = staffAccount ? staffAccount.fullName : (currentUser.role === 'admin' ? 'Admin' : 'Staff');

      logLockerEvent({
        lockerNumber,
        memberId,
        memberName,
        eventType: 'Checked In',
        eventDescription: `Check-in recorded, ${lockerNumber} assigned at ${nowFormatted}`,
        statusLabel: 'Check-In Logged',
        staffLogged: staffName,
        staffRole: currentUser.role,
        checkedInByStaffId: finalStaffId,
      });
    },
    [members, logLockerEvent, currentUser, staffList]
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

      // Automated Waitlist Trigger on Locker Release
      setWaitlist((prevWaitlist) => {
        const firstWaiting = prevWaitlist.find(
          (entry) => entry.resourceType === 'LOCKER' && entry.status === 'WAITING'
        );
        if (firstWaiting) {
          const expires = new Date();
          expires.setHours(expires.getHours() + 24); // 24-hour reservation window

          const updated = prevWaitlist.map((entry) => {
            if (entry.id === firstWaiting.id) {
              // Log the automated offer in locker logs asynchronously so we don't block
              setTimeout(() => {
                logLockerEvent({
                  lockerNumber: releasedLocker,
                  memberId: entry.memberId,
                  memberName: entry.memberName,
                  eventType: 'Checked In',
                  eventDescription: `Locker reserved for waitlisted member ${entry.memberName} (offer expires in 24 hours).`,
                  statusLabel: 'Check-In Logged',
                  staffLogged: 'System Auto-Reserve',
                  staffRole: 'admin',
                });
              }, 10);

              return {
                ...entry,
                status: 'OFFERED' as const,
                offeredLockerNumber: releasedLocker,
                offerExpiresAt: expires.toISOString(),
              };
            }
            return entry;
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem('arche_waitlist', JSON.stringify(updated));
          }
          return updated;
        }
        return prevWaitlist;
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
      const audit = createAuditEntry('NUTRIENT_SALE', saleData.productId, {
        ...saleData,
      }, currentUser.id);

      const now = new Date(audit.timestamp);
      const newSale: NutrientSaleLog = {
        ...saleData,
        id: audit.id,
        timestamp: audit.timestamp,
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
    [currentUser]
  );

  // Phase 3 Actions implementation
  const clockIn = useCallback((staffId: string, shiftId: string) => {
    const staff = staffList.find((s) => s.id === staffId);
    const staffName = staff ? staff.fullName : 'Staff Member';
    const newAttendance: StaffAttendance = {
      id: `attendance-${Date.now()}`,
      staffId,
      staffName,
      shiftId,
      clockInTime: new Date().toISOString(),
      status: 'ON_DUTY',
    };
    setAttendances((prev) => {
      const updated = [newAttendance, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('arche_staff_attendances', JSON.stringify(updated));
      }
      return updated;
    });
    createAuditEntry('STAFF_CLOCK_IN', staffId, { shiftId, staffName }, currentUser.id);
  }, [staffList, currentUser]);

  const clockOut = useCallback((attendanceId: string) => {
    setAttendances((prev) => {
      const updated = prev.map((a) => {
        if (a.id === attendanceId) {
          return {
            ...a,
            clockOutTime: new Date().toISOString(),
            status: 'COMPLETED' as const,
          };
        }
        return a;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('arche_staff_attendances', JSON.stringify(updated));
      }
      return updated;
    });
    createAuditEntry('STAFF_CLOCK_OUT', attendanceId, {}, currentUser.id);
  }, [currentUser]);

  const addSupplier = useCallback((sup: Supplier) => {
    setSuppliers((prev) => {
      const updated = [sup, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('arche_suppliers', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const updateSupplier = useCallback((sup: Supplier) => {
    setSuppliers((prev) => {
      const updated = prev.map((s) => (s.id === sup.id ? sup : s));
      if (typeof window !== 'undefined') {
        localStorage.setItem('arche_suppliers', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const deleteSupplier = useCallback((id: string) => {
    setSuppliers((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('arche_suppliers', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const createPurchaseOrder = useCallback((po: PurchaseOrder) => {
    setPurchaseOrders((prev) => {
      const updated = [po, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('arche_purchase_orders', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const receivePurchaseOrder = useCallback((poId: string) => {
    setPurchaseOrders((prev) => {
      let selectedPo: PurchaseOrder | undefined;
      const updated = prev.map((po) => {
        if (po.id === poId) {
          selectedPo = { ...po, status: 'RECEIVED' as const, receivedAt: new Date().toISOString() };
          return selectedPo;
        }
        return po;
      });

      if (selectedPo && selectedPo.status === 'RECEIVED') {
        // Log stock intakes and update inventory stock
        const newIntakes: StockIntakeLog[] = [];
        selectedPo.items.forEach((item) => {
          setNutrients((prevNutr) => {
            const updatedNutr = prevNutr.map((n) => {
              if (n.id === item.productId) {
                const newStock = n.stock + item.quantity;
                const marginPercent = Number((((n.price - item.unitPurchaseCost) / n.price) * 100).toFixed(2));
                
                newIntakes.push({
                  id: `intake-${Date.now()}-${item.productId}`,
                  purchaseOrderId: poId,
                  productId: item.productId,
                  productName: item.productName,
                  quantity: item.quantity,
                  unitPurchaseCost: item.unitPurchaseCost,
                  unitSellingPrice: n.price,
                  marginPercent,
                  timestamp: new Date().toISOString(),
                });

                return { ...n, stock: newStock };
              }
              return n;
            });
            if (typeof window !== 'undefined') {
              localStorage.setItem('arche_nutrient_products', JSON.stringify(updatedNutr));
            }
            return updatedNutr;
          });
        });

        if (newIntakes.length > 0) {
          setStockIntakes((prevIntakes) => {
            const updatedIntakes = [...newIntakes, ...prevIntakes];
            if (typeof window !== 'undefined') {
              localStorage.setItem('arche_stock_intakes', JSON.stringify(updatedIntakes));
            }
            return updatedIntakes;
          });
        }
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('arche_purchase_orders', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const cancelPurchaseOrder = useCallback((poId: string) => {
    setPurchaseOrders((prev) => {
      const updated = prev.map((po) => {
        if (po.id === poId) {
          return {
            ...po,
            status: 'CANCELLED' as const,
          };
        }
        return po;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('arche_purchase_orders', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const joinWaitlist = useCallback((resourceType: 'LOCKER' | 'GYM_FLOOR', memberId: string, memberName: string) => {
    const newEntry: WaitlistEntry = {
      id: `waitlist-${Date.now()}`,
      resourceType,
      memberId,
      memberName,
      joinedAt: new Date().toISOString(),
      status: 'WAITING',
    };
    setWaitlist((prev) => {
      const updated = [...prev, newEntry];
      if (typeof window !== 'undefined') {
        localStorage.setItem('arche_waitlist', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const leaveWaitlist = useCallback((id: string) => {
    setWaitlist((prev) => {
      const updated = prev.filter((entry) => entry.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('arche_waitlist', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const claimWaitlistOffer = useCallback((id: string) => {
    setWaitlist((prev) => {
      const updated = prev.map((entry) => {
        if (entry.id === id) {
          return {
            ...entry,
            status: 'CLAIMED' as const,
          };
        }
        return entry;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('arche_waitlist', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const value = useMemo<DashboardContextValue>(
    () => ({
      tenantId,
      locations,
      selectedLocationId,
      tenantContext,
      setSelectedLocationId,
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
      directoryFilter,
      attendances,
      suppliers,
      purchaseOrders,
      stockIntakes,
      waitlist,
      maxGymCapacity,
      setActiveTab,
      setDirectoryFilter,
      setMobileMenuOpen,
      setSidebarCollapsed,
      toggleSidebar,
      setStatusMessage,
      login,
      logout,
      switchRole,
      setMaxGymCapacity,
      updateMember,
      registerMember,
      deleteMember,
      extendMember,
      checkInMember,
      checkOutMember,
      cancelAndRefundMember,
      evaluateMembershipStatuses,
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
      clockIn,
      clockOut,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      createPurchaseOrder,
      receivePurchaseOrder,
      cancelPurchaseOrder,
      joinWaitlist,
      leaveWaitlist,
      claimWaitlistOffer,
    }),
    [
      tenantId,
      locations,
      selectedLocationId,
      tenantContext,
      setSelectedLocationId,
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
      directoryFilter,
      attendances,
      suppliers,
      purchaseOrders,
      stockIntakes,
      waitlist,
      maxGymCapacity,
      setActiveTab,
      setDirectoryFilter,
      toggleSidebar,
      login,
      logout,
      switchRole,
      setMaxGymCapacity,
      updateMember,
      registerMember,
      deleteMember,
      extendMember,
      checkInMember,
      checkOutMember,
      cancelAndRefundMember,
      evaluateMembershipStatuses,
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
      clockIn,
      clockOut,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      createPurchaseOrder,
      receivePurchaseOrder,
      cancelPurchaseOrder,
      joinWaitlist,
      leaveWaitlist,
      claimWaitlistOffer,
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
