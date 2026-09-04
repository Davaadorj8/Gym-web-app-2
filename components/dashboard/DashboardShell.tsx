'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useAppLocale } from '@/components/I18nProvider';
import { Zap, Menu, X } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import { useDashboard } from '@/lib/orchestration';
import { AuthUser, UserRole } from '@/lib/types';
import ViewSkeleton from '@/components/dashboard/ViewSkeleton';

import BranchSwitcherWidget from '@/components/dashboard/BranchSwitcherWidget';
import StaffClockInOutWidget from '@/components/dashboard/StaffClockInOutWidget';

// Dynamic lazy-loaded views with Suspense skeleton loaders
const MemberDirectoryView = dynamic(
  () => import('@/components/dashboard/MemberDirectoryView'),
  { loading: () => <ViewSkeleton tab="directory" /> }
);
const LockerUsageView = dynamic(
  () => import('@/components/dashboard/LockerUsageView'),
  { loading: () => <ViewSkeleton tab="locker" /> }
);
const CheckInDeskView = dynamic(
  () => import('@/components/dashboard/CheckInDeskView'),
  { loading: () => <ViewSkeleton tab="checkin-desk" /> }
);
const InventoryView = dynamic(
  () => import('@/components/dashboard/InventoryView'),
  { loading: () => <ViewSkeleton tab="inventory" /> }
);
const AnalyticsView = dynamic(
  () => import('@/components/dashboard/AnalyticsView'),
  { loading: () => <ViewSkeleton tab="analytics" /> }
);
const StaffApprovalsView = dynamic(
  () => import('@/components/dashboard/StaffApprovalsView'),
  { loading: () => <ViewSkeleton tab="approvals" /> }
);
const RegistrationView = dynamic(
  () => import('@/components/dashboard/RegistrationView'),
  { loading: () => <ViewSkeleton tab="registration" /> }
);

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
  children?: React.ReactNode;
}

const getTabMeta = (tab: string, locale: string) => {
  const meta: Record<string, { en: string; mn: string }> = {
    dashboard: { en: 'Analytics & Insights', mn: 'Хяналтын самбар' },
    analytics: { en: 'Analytics & Insights', mn: 'Хяналтын самбар' },
    directory: { en: 'Member Directory', mn: 'Гишүүдийн бүртгэл' },
    locker: { en: 'Locker Assignment', mn: 'Шүүгээний ашиглалт' },
    'checkin-desk': { en: 'Check-In Desk', mn: 'Нэвтрэх хэсэг' },
    inventory: { en: 'Nutrient Inventory', mn: 'Бараа материалын бүртгэл' },
    approvals: { en: 'Staff Approvals', mn: 'Ажилтны зөвшөөрөл' },
    registration: { en: 'Member Registration', mn: 'Шинэ гишүүн бүртгэх' },
  };
  const fallback = meta['dashboard'];
  const t = meta[tab] || fallback;
  return locale === 'mn' ? t.mn : t.en;
};

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
  children,
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
        className="flex-1 min-h-screen w-full p-[clamp(0.75rem,1.5vw,1.5rem)] overflow-y-auto"
      >
        {/* Top Header Bar */}
        <header className="w-full flex flex-wrap items-center justify-between gap-3 mb-[clamp(1rem,2vh,1.75rem)] pb-4 border-b border-border">
          <div className="flex flex-col">
            <h1 className="text-[clamp(1.25rem,1.8vw,1.75rem)] font-bold text-foreground tracking-tight">
              {getTabMeta(activeTab, locale)}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Arche.fitness CRM — {locale === 'mn' ? 'Үйл ажиллагааны удирдлага' : 'Operational Management Console'}
            </p>
          </div>

          {/* Header Controls: Branch Switcher & Staff Shift Attendance Widget */}
          <div className="flex flex-wrap items-center gap-2">
            <BranchSwitcherWidget />
            <StaffClockInOutWidget />
          </div>
        </header>

        <Suspense fallback={<ViewSkeleton tab={activeTab} />}>
          {children ? (
            children
          ) : activeTab === 'directory' ? (
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
        </Suspense>
      </main>
    </div>
  );
}
