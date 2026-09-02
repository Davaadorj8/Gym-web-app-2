const fs = require('fs');

const tab1 = fs.readFileSync('tab1.txt', 'utf8');
const tab2 = fs.readFileSync('tab2.txt', 'utf8');
const tab3 = fs.readFileSync('tab3.txt', 'utf8');
const tab4 = fs.readFileSync('tab4.txt', 'utf8');
const tab5 = fs.readFileSync('tab5.txt', 'utf8');
const tab6 = fs.readFileSync('tab6.txt', 'utf8');

const imports = `
'use client';
import React from 'react';
import { Card } from '@/components/ui';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { cn, formatCurrency } from '@/lib/utils';
import { ShieldAlert, LogOut, Download, Filter, Search, CreditCard, RefreshCw, Layers, ShoppingCart, Calendar, Target, Clock, ArrowUpRight, ArrowDownRight, Package, Wrench, Sparkles, KeyRound } from 'lucide-react';
`;

function writeTab(name, content) {
  const code = `${imports}
export function ${name}({ data, locale }: { data: any, locale: string }) {
  const {
    t, isAdmin, activeTab, searchMemberQuery, selectedCategoryFilter, selectedPeriodFilter, trafficViewMode, financialChartMode, nutrientChartMode, searchNutrientQuery, selectedNutrientCategoryFilter, selectedNutrientStatusFilter, searchSalesQuery, currentGymOccupancy, totalSupplementsRevenue, totalMembershipValue, totalCheckInsLogged, activeMembersCount, expiringThisWeekCount, retentionRate, weeklyDistribution, hourlyTraffic, peakTrafficHour, membersByPlanTier, extensionSummary, activeOccupants, lockerMetrics, lockerStatusCounts, filteredAuditLogs, categoryChartData, periodChartData, planTierChartData, nutrients, rawNutrientSales, nutrientSales, nutrientMetrics, filteredNutrientList, filteredSalesLogs, PLAN_TIER_COLORS, setFinancialChartMode, setTrafficViewMode, setSearchMemberQuery, setSelectedCategoryFilter, setSelectedPeriodFilter, setNutrientChartMode, setSearchNutrientQuery, setSelectedNutrientCategoryFilter, setSelectedNutrientStatusFilter, setSearchSalesQuery
  } = data;

  return (
    <>
${content}
    </>
  );
}
`;
  fs.writeFileSync(`components/dashboard/analytics/${name}.tsx`, code);
}

writeTab('FinancialAnalyticsTab', tab1);
writeTab('OperationalAnalyticsTab', tab2);
writeTab('PlanAnalyticsTab', tab3);
writeTab('NutrientAnalyticsTab', tab4);
writeTab('LockerAnalyticsTab', tab5);
writeTab('MembersAnalyticsTab', tab6);

console.log("Tab components created.");
