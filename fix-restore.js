const fs = require('fs');

const tab1 = fs.readFileSync('tab1.txt', 'utf8');
const tab2 = fs.readFileSync('tab2.txt', 'utf8');
const tab3 = fs.readFileSync('tab3.txt', 'utf8');
const tab4 = fs.readFileSync('tab4.txt', 'utf8');
const tab5 = fs.readFileSync('tab5.txt', 'utf8');
const tab6 = fs.readFileSync('tab6.txt', 'utf8');

const hookContent = fs.readFileSync('analytics-hook-content.txt', 'utf8');

const prefix = `
'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Badge } from '@/components/ui';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Activity, Users, DollarSign, Target, Clock, ArrowUpRight, ArrowDownRight, Package, Wrench, Sparkles, KeyRound, Download, Filter, Search, CreditCard, RefreshCw, Layers, ShoppingCart, Calendar, ShieldAlert, LogOut
} from 'lucide-react';
import { useDashboard } from '@/lib/orchestration';
import { useAppLocale } from '@/components/I18nProvider';
import { cn, formatCurrency, getNutrientExpiryStatus } from '@/lib/utils';
import { BuiltPlan, Member, AuditRecord, LockerCustomStatus } from '@/lib/types';

type AnalyticsTab = 'financial' | 'operational' | 'plans' | 'nutrients' | 'lockers' | 'members';
const PLAN_TIER_COLORS = ['#3b82f6', '#38bdf8', '#10b981', '#f59e0b', '#a78bfa'];

function calculateTotalMembershipValue(members: Member[], plans: BuiltPlan[]): number {
  return members.reduce((acc, member) => {
    if (member.occupancyStatus !== 'Checked In') return acc;
    const plan = plans.find(p => p.id === member.planId);
    return acc + (plan?.price || 0);
  }, 0);
}

function calculateWeeklyDistribution(logs: AuditRecord[]) {
  const dist = Array(7).fill(0);
  logs.forEach(log => {
    const day = new Date(log.timestamp).getDay();
    dist[day === 0 ? 6 : day - 1]++;
  });
  return [
    { name: 'Mon', checkIns: dist[0] }, { name: 'Tue', checkIns: dist[1] },
    { name: 'Wed', checkIns: dist[2] }, { name: 'Thu', checkIns: dist[3] },
    { name: 'Fri', checkIns: dist[4] }, { name: 'Sat', checkIns: dist[5] },
    { name: 'Sun', checkIns: dist[6] },
  ];
}

function calculateHourlyTraffic(logs: AuditRecord[]) {
  const dist = Array(24).fill(0);
  logs.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    dist[hour]++;
  });
  return Array.from({ length: 24 }, (_, i) => ({
    time: \`\${i.toString().padStart(2, '0')}:00\`,
    count: dist[i]
  }));
}

function calculateMembersByPlanTier(members: Member[], plans: BuiltPlan[]) {
  const counts: Record<string, number> = {};
  members.forEach(m => {
    const plan = plans.find(p => p.id === m.planId);
    if (plan) {
      counts[plan.categoryTarget] = (counts[plan.categoryTarget] || 0) + 1;
    }
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function aggregateExtensionMetrics(members: Member[]) {
  let totalExtensions = 0;
  let totalExtensionRevenue = 0;
  let recentExtensions = 0;
  const byCategory: Record<string, number> = {};

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  members.forEach(m => {
    if (m.extensionHistory && m.extensionHistory.length > 0) {
      totalExtensions += m.extensionHistory.length;
      m.extensionHistory.forEach(ext => {
        totalExtensionRevenue += ext.feePaid;
        byCategory[ext.reasonCategory] = (byCategory[ext.reasonCategory] || 0) + 1;
        if (ext.timestamp > thirtyDaysAgo) {
          recentExtensions++;
        }
      });
    }
  });

  return { totalExtensions, totalExtensionRevenue, byCategory, recentExtensions };
}

function calculateOccupancyMetrics(members: Member[], lockerStatuses: Record<string, LockerCustomStatus>) {
  let activeOccupants = 0;
  const statusCounts: Record<LockerCustomStatus, number> = {
    clean: 0, repair: 0, key_lost: 0, key_not_returned: 0, inactive: 0, available: 0, occupied: 0
  };

  members.forEach(m => {
    if (m.occupancyStatus === 'Checked In' && m.assignedLocker) {
      activeOccupants++;
      statusCounts.occupied++;
    }
  });

  Object.values(lockerStatuses).forEach(status => {
    if (status !== 'available' && status !== 'occupied') {
      statusCounts[status]++;
    }
  });

  return { activeOccupants, statusCounts };
}

export default function AnalyticsView() {
`;

const wrapperOpen = `      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">`;
const wrapperClose = `      </div>`;

const fullContent = prefix + hookContent + `
  return (
    <div id="analytics-view-root" className="w-full space-y-6">
      {/* Top Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t('title') || 'Analytics & Insights Dashboard'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('subtitle') || 'Comprehensive operational and financial metrics.'}
        </p>

        {/* Switch Tabs Navigation */}
        <div className="flex items-center gap-6 border-b border-border/80 text-xs font-mono font-bold tracking-wider overflow-x-auto select-none pt-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AnalyticsTab)}
                className={cn(
                  'pb-2.5 px-0.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap',
                  activeTab === tab.id
                    ? 'text-[#D4FF00] border-[#D4FF00]'
                    : 'text-muted-foreground hover:text-foreground border-transparent'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      {activeTab === 'financial' && (
${wrapperOpen}
${tab1}
${wrapperClose}
      )}
      {activeTab === 'operational' && (
${wrapperOpen}
${tab2}
${wrapperClose}
      )}
      {activeTab === 'plans' && (
${wrapperOpen}
${tab3}
${wrapperClose}
      )}
      {activeTab === 'nutrients' && (
${wrapperOpen}
${tab4}
${wrapperClose}
      )}
      {activeTab === 'lockers' && (
${wrapperOpen}
${tab5}
${wrapperClose}
      )}
      {activeTab === 'members' && (
${wrapperOpen}
${tab6}
${wrapperClose}
      )}
    </div>
  );
}
`;
fs.writeFileSync('components/dashboard/AnalyticsView.tsx', fullContent);
console.log("Restored properly");
