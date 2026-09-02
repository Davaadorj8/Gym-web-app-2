const fs = require('fs');
const hookContent = fs.readFileSync('analytics-hook-content.txt', 'utf8');
const tab1 = fs.readFileSync('tab1.txt', 'utf8');
const tab2 = fs.readFileSync('tab2.txt', 'utf8');
const tab3 = fs.readFileSync('tab3.txt', 'utf8');
const tab4 = fs.readFileSync('tab4.txt', 'utf8');
const tab5 = fs.readFileSync('tab5.txt', 'utf8');
const tab6 = fs.readFileSync('tab6.txt', 'utf8');

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

type AnalyticsTab = 'financial' | 'operational' | 'plans' | 'nutrients' | 'lockers' | 'members';
const PLAN_TIER_COLORS = ['#3b82f6', '#38bdf8', '#10b981', '#f59e0b', '#a78bfa'];

export default function AnalyticsView() {
`;
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
` + tab1 + `
      {activeTab === 'operational' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
` + tab2 + `
      {activeTab === 'plans' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
` + tab3 + `
      {activeTab === 'nutrients' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
` + tab4 + `
      {activeTab === 'lockers' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
` + tab5 + `
      {activeTab === 'members' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
` + tab6;

fs.writeFileSync('components/dashboard/AnalyticsView.tsx', fullContent);
console.log("Restored");
