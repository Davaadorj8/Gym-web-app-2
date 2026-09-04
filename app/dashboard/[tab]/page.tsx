'use client';

import React, { use, Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/lib/orchestration';
import ViewSkeleton from '@/components/dashboard/ViewSkeleton';

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

export default function TabPage({
  params,
}: {
  params: Promise<{ tab: string }> | { tab: string };
}) {
  const resolvedParams = use(params as Promise<{ tab: string }>);
  const tab = resolvedParams?.tab || 'directory';

  const {
    isAuthenticated,
    isLoading,
    statusMessage,
    setStatusMessage,
    login,
    setActiveTab,
  } = useDashboard();
  const router = useRouter();

  // Sync route tab parameter with DashboardContext activeTab
  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab, setActiveTab]);

  if (!isAuthenticated && !isLoading) {
    return <ViewSkeleton tab={tab} />;
  }

  const handleNavigateToRegistration = () => router.push('/dashboard/registration');
  const handleNavigateToCheckIn = () => router.push('/dashboard/checkin-desk');
  const handleNavigateToInventory = () => router.push('/dashboard/inventory');

  return (
    <Suspense fallback={<ViewSkeleton tab={tab} />}>
      {tab === 'directory' ? (
        <MemberDirectoryView
          onNavigateToRegistration={handleNavigateToRegistration}
          onNavigateToCheckIn={handleNavigateToCheckIn}
        />
      ) : tab === 'locker' ? (
        <LockerUsageView
          onNavigateToCheckIn={handleNavigateToCheckIn}
          onNavigateToInventory={handleNavigateToInventory}
        />
      ) : tab === 'checkin-desk' ? (
        <CheckInDeskView
          onNavigateToRegistration={handleNavigateToRegistration}
        />
      ) : tab === 'inventory' ? (
        <InventoryView />
      ) : tab === 'analytics' || tab === 'dashboard' ? (
        <AnalyticsView />
      ) : tab === 'approvals' ? (
        <StaffApprovalsView />
      ) : tab === 'registration' ? (
        <RegistrationView
          onNavigateToInventory={handleNavigateToInventory}
        />
      ) : (
        <MemberDirectoryView
          onNavigateToRegistration={handleNavigateToRegistration}
          onNavigateToCheckIn={handleNavigateToCheckIn}
        />
      )}
    </Suspense>
  );
}
