'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useAppLocale } from '@/components/I18nProvider';
import { Zap, Menu, X, Loader2 } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import { useDashboard } from '@/lib/orchestration';
import { AuthUser, UserRole } from '@/lib/types';

const ViewLoadingSkeleton = () => (
  <div className="w-full h-96 flex flex-col items-center justify-center gap-3 text-muted-foreground animate-pulse">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
    <span className="text-sm font-medium">Loading view...</span>
  </div>
);

const RegistrationView = dynamic(
  () => import('@/components/dashboard/RegistrationView'),
  { loading: () => <ViewLoadingSkeleton /> }
);
const InventoryView = dynamic(
  () => import('@/components/dashboard/InventoryView'),
  { loading: () => <ViewLoadingSkeleton /> }
);
const CheckInDeskView = dynamic(
  () => import('@/components/dashboard/CheckInDeskView'),
  { loading: () => <ViewLoadingSkeleton /> }
);
const LockerUsageView = dynamic(
  () => import('@/components/dashboard/LockerUsageView'),
  { loading: () => <ViewLoadingSkeleton /> }
);
const MemberDirectoryView = dynamic(
  () => import('@/components/dashboard/MemberDirectoryView'),
  { loading: () => <ViewLoadingSkeleton /> }
);
const AnalyticsView = dynamic(
  () => import('@/components/dashboard/AnalyticsView'),
  { loading: () => <ViewLoadingSkeleton /> }
);
const StaffApprovalsView = dynamic(
  () => import('@/components/dashboard/StaffApprovalsView'),
  { loading: () => <ViewLoadingSkeleton /> }
);

interface DashboardShellProps {
  currentUser?: AuthUser;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  onLogout?: () => void;
  onSwitchRole?: (role: UserRole) => void;
}

export default function DashboardShell({
  currentUser: propCurrentUser,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  mobileMenuOpen: propMobileMenuOpen,
  setMobileMenuOpen: propSetMobileMenuOpen,
  onLogout: propOnLogout,
  onSwitchRole: propOnSwitchRole,
}: DashboardShellProps = {}) {
  const dashboard = useDashboard();
  const currentUser = propCurrentUser ?? dashboard.currentUser;
  const activeTab = propActiveTab ?? dashboard.activeTab;
  const setActiveTab = propSetActiveTab ?? dashboard.setActiveTab;
  const mobileMenuOpen = propMobileMenuOpen ?? dashboard.mobileMenuOpen;
  const setMobileMenuOpen = propSetMobileMenuOpen ?? dashboard.setMobileMenuOpen;
  const onLogout = propOnLogout ?? dashboard.logout;
  const onSwitchRole = propOnSwitchRole ?? dashboard.switchRole;

  const { locale, setLocale } = useAppLocale();

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
          <span className="font-extrabold text-sm text-foreground">Arche Gym</span>
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
        />
      </div>

      {/* Main Content Area */}
      <main
        id="main-content-area"
        className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto w-full overflow-y-auto"
      >
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
