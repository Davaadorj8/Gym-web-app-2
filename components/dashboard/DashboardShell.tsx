'use client';

import React from 'react';
import { useAppLocale } from '@/components/I18nProvider';
import { Zap, Menu, X, Clock } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import { useDashboard } from '@/lib/orchestration';
import { AuthUser, UserRole } from '@/lib/types';

import RegistrationView from '@/components/dashboard/RegistrationView';
import InventoryView from '@/components/dashboard/InventoryView';
import CheckInDeskView from '@/components/dashboard/CheckInDeskView';
import LockerUsageView from '@/components/dashboard/LockerUsageView';
import MemberDirectoryView from '@/components/dashboard/MemberDirectoryView';
import AnalyticsView from '@/components/dashboard/AnalyticsView';
import StaffApprovalsView from '@/components/dashboard/StaffApprovalsView';

interface DashboardShellProps {
  currentUser?: AuthUser;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onLogout?: () => void;
  onSwitchRole?: (role: UserRole) => void;
}

function StaffClockInOutWidget() {
  const { staffList, attendances, clockIn, clockOut, currentUser } = useDashboard();
  const [selectedStaffId, setSelectedStaffId] = React.useState('');
  const [selectedShiftId, setSelectedShiftId] = React.useState('shift-morning');
  const [showForm, setShowForm] = React.useState(false);

  // Auto-set selected staff
  React.useEffect(() => {
    if (currentUser && currentUser.role === 'staff') {
      const found = staffList.find(s => s.id === currentUser.id);
      if (found) {
        setSelectedStaffId(found.id);
      }
    } else if (staffList.length > 0 && !selectedStaffId) {
      setSelectedStaffId(staffList[0].id);
    }
  }, [currentUser, staffList, selectedStaffId]);

  const activeAttendance = attendances.find((a) => a.status === 'ON_DUTY');

  const shifts = [
    { id: 'shift-morning', name: 'Morning (06:00 - 14:00)' },
    { id: 'shift-afternoon', name: 'Afternoon (14:00 - 22:00)' },
    { id: 'shift-night', name: 'Night (22:00 - 06:00)' },
  ];

  if (activeAttendance) {
    const shiftName = shifts.find(s => s.id === activeAttendance.shiftId)?.name || 'Custom Shift';
    return (
      <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 px-3.5 py-2 rounded-xl text-sm" id="staff-clock-in-out-widget">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
        <div className="text-foreground font-medium">
          <span className="font-bold text-green-700 dark:text-green-400">{activeAttendance.staffName}</span> is{' '}
          <span className="text-green-600 dark:text-green-500 font-bold">ON DUTY</span> ({shiftName})
        </div>
        <button
          type="button"
          onClick={() => clockOut(activeAttendance.id)}
          className="ml-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
        >
          Clock Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 bg-muted/50 border border-border px-3.5 py-2 rounded-xl text-sm w-full md:w-auto" id="staff-clock-in-out-widget">
      <div className="flex items-center gap-2 text-muted-foreground mr-1">
        <Clock className="w-4 h-4 text-muted-foreground animate-spin-slow" />
        <span className="font-semibold text-xs sm:text-sm">No Active Shift Staffed</span>
      </div>

      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold hover:opacity-90 rounded-lg text-xs transition-opacity cursor-pointer"
        >
          Open Clock-In Console
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="px-2.5 py-1 bg-background border border-border text-foreground rounded-lg text-xs max-w-[150px]"
          >
            <option value="" disabled>Select Staff</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>
          <select
            value={selectedShiftId}
            onChange={(e) => setSelectedShiftId(e.target.value)}
            className="px-2.5 py-1 bg-background border border-border text-foreground rounded-lg text-xs"
          >
            {shifts.map((sh) => (
              <option key={sh.id} value={sh.id}>
                {sh.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (selectedStaffId && selectedShiftId) {
                  clockIn(selectedStaffId, selectedShiftId);
                  setShowForm(false);
                }
              }}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-xs cursor-pointer"
            >
              Clock In
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-2.5 py-1 bg-muted border border-border text-muted-foreground hover:text-foreground rounded-lg text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardShell({
  currentUser: propCurrentUser,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  mobileMenuOpen: propMobileMenuOpen,
  setMobileMenuOpen: propSetMobileMenuOpen,
  sidebarCollapsed: propSidebarCollapsed,
  onToggleSidebar: propOnToggleSidebar,
  onLogout: propOnLogout,
  onSwitchRole: propOnSwitchRole,
}: DashboardShellProps = {}) {
  const dashboard = useDashboard();
  const currentUser = propCurrentUser ?? dashboard.currentUser;
  const activeTab = propActiveTab ?? dashboard.activeTab;
  const setActiveTab = propSetActiveTab ?? dashboard.setActiveTab;
  const mobileMenuOpen = propMobileMenuOpen ?? dashboard.mobileMenuOpen;
  const setMobileMenuOpen = propSetMobileMenuOpen ?? dashboard.setMobileMenuOpen;
  const sidebarCollapsed = propSidebarCollapsed ?? dashboard.sidebarCollapsed;
  const onToggleSidebar = propOnToggleSidebar ?? dashboard.toggleSidebar;
  const onLogout = propOnLogout ?? dashboard.logout;
  const onSwitchRole = propOnSwitchRole ?? dashboard.switchRole;

  const { locale, setLocale } = useAppLocale();

  const lastWidthRef = React.useRef<number | null>(null);

  // Auto-collapse sidebar only when entering the smaller tablet screen range (768px to 1024px)
  // to avoid overriding manual user toggle actions and preventing expansion.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const { setSidebarCollapsed } = dashboard;

    const handleResize = () => {
      const width = window.innerWidth;
      const prevWidth = lastWidthRef.current;

      if (width >= 768 && width < 1024) {
        if (prevWidth === null || prevWidth < 768 || prevWidth >= 1024) {
          setSidebarCollapsed(true);
        }
      }

      lastWidthRef.current = width;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dashboard]);

  return (
    <div
      id="admin-portal-layout"
      className="min-h-screen w-full bg-background flex flex-col md:flex-row text-foreground overflow-x-hidden"
    >
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-background border-b border-border z-30 sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground fill-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-sm text-foreground">Arche.fitness</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLocale(locale === 'en' ? 'mn' : 'en')}
            className="px-2.5 py-1 text-xs font-mono font-bold bg-muted border border-border text-primary rounded-lg cursor-pointer"
          >
            {locale.toUpperCase()}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              onLogout={onLogout}
              onCheckInClick={() => {
                setActiveTab('checkin-desk');
                setMobileMenuOpen(false);
              }}
              currentUser={currentUser}
              onSwitchRole={onSwitchRole}
            />
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={onLogout}
          onCheckInClick={() => setActiveTab('checkin-desk')}
          currentUser={currentUser}
          onSwitchRole={onSwitchRole}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={onToggleSidebar}
        />
      </div>

      {/* Main Content Area */}
      <main
        id="main-content-area"
        className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto w-full overflow-y-auto"
      >
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {activeTab === 'dashboard' || activeTab === 'analytics'
                ? locale === 'mn' ? 'Хяналтын самбар' : 'Analytics & Insights'
                : activeTab === 'directory'
                ? locale === 'mn' ? 'Гишүүдийн бүртгэл' : 'Member Directory'
                : activeTab === 'locker'
                ? locale === 'mn' ? 'Шүүгээний ашиглалт' : 'Locker Assignment'
                : activeTab === 'checkin-desk'
                ? locale === 'mn' ? 'Нэвтрэх хэсэг' : 'Check-In Desk'
                : activeTab === 'inventory'
                ? locale === 'mn' ? 'Бараа материалын бүртгэл' : 'Nutrient Inventory'
                : activeTab === 'approvals'
                ? locale === 'mn' ? 'Ажилтны зөвшөөрөл' : 'Staff Approvals'
                : locale === 'mn' ? 'Шинэ гишүүн бүртгэх' : 'Member Registration'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Arche.fitness CRM — {locale === 'mn' ? 'Үйл ажиллагааны удирдлага' : 'Operational Management Console'}
            </p>
          </div>

          {/* Staff Shift Attendance Widget */}
          <StaffClockInOutWidget />
        </div>

        {activeTab === 'directory' ? (
          <MemberDirectoryView
            onNavigateToRegistration={() => setActiveTab('registration')}
            onNavigateToCheckIn={() => setActiveTab('checkin-desk')}
          />
        ) : activeTab === 'locker' ? (
          <LockerUsageView
            onNavigateToCheckIn={() => setActiveTab('checkin-desk')}
            onNavigateToInventory={() => setActiveTab('inventory')}
          />
        ) : activeTab === 'checkin-desk' ? (
          <CheckInDeskView
            onNavigateToRegistration={() => setActiveTab('registration')}
          />
        ) : activeTab === 'inventory' ? (
          <InventoryView />
        ) : activeTab === 'analytics' || activeTab === 'dashboard' ? (
          <AnalyticsView />
        ) : activeTab === 'approvals' ? (
          <StaffApprovalsView />
        ) : (
          <RegistrationView
            onNavigateToInventory={() => setActiveTab('inventory')}
          />
        )}
      </main>
    </div>
  );
}
