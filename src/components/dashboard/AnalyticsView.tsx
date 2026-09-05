'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';
import { useDashboard } from '@/lib/orchestration';
import { cn } from '@/lib/utils';
import { AnalyticsTab } from './analytics';
import ViewSkeleton from './ViewSkeleton';

// Each sub-tab is lazy-loaded on selection instead of bundled into the initial
// analytics chunk — three of them (Operational, Plans, Nutrients) pull in recharts,
// which most sessions never need if they only look at the default Financial tab.
const FinancialTab = dynamic(() => import('./analytics/FinancialTab').then((m) => m.FinancialTab), {
  loading: () => <ViewSkeleton title="Financial Overview" />,
});
const OperationalTab = dynamic(() => import('./analytics/OperationalTab').then((m) => m.OperationalTab), {
  loading: () => <ViewSkeleton title="Operational Metrics" />,
});
const PlansTab = dynamic(() => import('./analytics/PlansTab').then((m) => m.PlansTab), {
  loading: () => <ViewSkeleton title="Plans & Products" />,
});
const NutrientsTab = dynamic(() => import('./analytics/NutrientsTab').then((m) => m.NutrientsTab), {
  loading: () => <ViewSkeleton title="Nutrient POS" />,
});
const LockersTab = dynamic(() => import('./analytics/LockersTab').then((m) => m.LockersTab), {
  loading: () => <ViewSkeleton title="Lockers" />,
});
const MembersTab = dynamic(() => import('./analytics/MembersTab').then((m) => m.MembersTab), {
  loading: () => <ViewSkeleton title="Members & Renewals" />,
});

export default function AnalyticsView() {
  const dashboard = useDashboard();
  const t = useTranslations('Analytics');
  const currentUser = dashboard.currentUser;
  const isAdmin = !currentUser || currentUser.role === 'admin';

  const [activeTab, setActiveTab] = useState<AnalyticsTab>('financial');

  if (!isAdmin) {
    return (
      <div id="analytics-access-denied" className="w-full py-12 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-foreground">{t('adminOnly') || 'Admin Access Only'}</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            Analytics metrics and reports are restricted to system Admin accounts.
          </p>
        </div>
      </div>
    );
  }

  const nutrientSalesTotal = (dashboard.nutrientSales || []).reduce(
    (acc: number, s: { totalPrice?: number }) => acc + (s.totalPrice || 0),
    0
  );

  const lockersOccupiedCount = dashboard.members.filter((m) => m.assignedLocker !== null).length;

  return (
    <div id="analytics-view-root" className="w-full space-y-4">
      {/* Header & Sub-Tabs Navigation */}
      <div className="space-y-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t('title') || 'Analytics & Performance Metrics'}
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Executive financial insights, member retention tracking, traffic volume, and inventory health.
          </p>
        </div>

        <div className="flex items-center gap-5 border-b border-border/80 text-xs font-mono font-bold tracking-wider overflow-x-auto select-none pt-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('financial')}
            className={cn(
              'pb-2 px-0.5 border-b-2 transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'financial'
                ? 'text-[#D4FF00] border-[#D4FF00]'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            FINANCIAL
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('operational')}
            className={cn(
              'pb-2 px-0.5 border-b-2 transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'operational'
                ? 'text-[#D4FF00] border-[#D4FF00]'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            OPERATIONAL
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={cn(
              'pb-2 px-0.5 border-b-2 transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'plans'
                ? 'text-[#D4FF00] border-[#D4FF00]'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            PLANS &amp; PRODUCTS
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nutrients')}
            className={cn(
              'pb-2 px-0.5 border-b-2 transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'nutrients'
                ? 'text-[#D4FF00] border-[#D4FF00]'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            NUTRIENT POS
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lockers')}
            className={cn(
              'pb-2 px-0.5 border-b-2 transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'lockers'
                ? 'text-[#D4FF00] border-[#D4FF00]'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            LOCKERS
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={cn(
              'pb-2 px-0.5 border-b-2 transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'members'
                ? 'text-[#D4FF00] border-[#D4FF00]'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            MEMBERS &amp; RENEWALS
          </button>
        </div>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'financial' && (
        <FinancialTab
          members={dashboard.members}
          plans={dashboard.plans}
          nutrientSalesTotal={nutrientSalesTotal}
        />
      )}

      {activeTab === 'operational' && (
        <OperationalTab
          checkInLogs={dashboard.lockerLogs}
          totalMembersCount={dashboard.members.length}
          currentCheckedInCount={dashboard.members.filter((m) => m.occupancyStatus === 'Checked In').length}
        />
      )}

      {activeTab === 'plans' && (
        <PlansTab plans={dashboard.plans} members={dashboard.members} />
      )}

      {activeTab === 'nutrients' && (
        <NutrientsTab
          nutrients={dashboard.nutrients}
          salesHistory={dashboard.nutrientSales}
        />
      )}

      {activeTab === 'lockers' && (
        <LockersTab
          totalLockers={dashboard.totalLockers}
          lockersOccupiedCount={lockersOccupiedCount}
          lockerServiceStatuses={dashboard.lockerStatuses || {}}
        />
      )}

      {activeTab === 'members' && (
        <MembersTab members={dashboard.members} />
      )}
    </div>
  );
}
