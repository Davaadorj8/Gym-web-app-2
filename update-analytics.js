const fs = require('fs');
let content = fs.readFileSync('components/dashboard/AnalyticsView.tsx', 'utf8');

const importStatement = `
import { FinancialAnalyticsTab } from './analytics/FinancialAnalyticsTab';
import { OperationalAnalyticsTab } from './analytics/OperationalAnalyticsTab';
import { PlanAnalyticsTab } from './analytics/PlanAnalyticsTab';
import { NutrientAnalyticsTab } from './analytics/NutrientAnalyticsTab';
import { LockerAnalyticsTab } from './analytics/LockerAnalyticsTab';
import { MembersAnalyticsTab } from './analytics/MembersAnalyticsTab';
`;

content = content.replace("import { BuiltPlan, Member, AuditRecord, LockerCustomStatus } from '@/lib/types';", "import { BuiltPlan, Member, AuditRecord, LockerCustomStatus } from '@/lib/types';\n" + importStatement);

const returnStart = content.indexOf('  return (\n    <div id="analytics-view-root"');

// Create a data object
const dataObj = `
  const data = {
    t, isAdmin, activeTab, searchMemberQuery, selectedCategoryFilter, selectedPeriodFilter, trafficViewMode, financialChartMode, nutrientChartMode, searchNutrientQuery, selectedNutrientCategoryFilter, selectedNutrientStatusFilter, searchSalesQuery, currentGymOccupancy, totalSupplementsRevenue, totalMembershipValue, totalCheckInsLogged, activeMembersCount, expiringThisWeekCount, retentionRate, weeklyDistribution, hourlyTraffic, peakTrafficHour, membersByPlanTier, extensionSummary, activeOccupants, lockerMetrics, lockerStatusCounts, filteredAuditLogs, categoryChartData, periodChartData, planTierChartData, nutrients, rawNutrientSales, nutrientSales, nutrientMetrics, filteredNutrientList, filteredSalesLogs, PLAN_TIER_COLORS, setFinancialChartMode, setTrafficViewMode, setSearchMemberQuery, setSelectedCategoryFilter, setSelectedPeriodFilter, setNutrientChartMode, setSearchNutrientQuery, setSelectedNutrientCategoryFilter, setSelectedNutrientStatusFilter, setSearchSalesQuery
  };
`;

const returnContent = `
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

      {activeTab === 'financial' && <FinancialAnalyticsTab data={data} locale={locale} />}
      {activeTab === 'operational' && <OperationalAnalyticsTab data={data} locale={locale} />}
      {activeTab === 'plans' && <PlanAnalyticsTab data={data} locale={locale} />}
      {activeTab === 'nutrients' && <NutrientAnalyticsTab data={data} locale={locale} />}
      {activeTab === 'lockers' && <LockerAnalyticsTab data={data} locale={locale} />}
      {activeTab === 'members' && <MembersAnalyticsTab data={data} locale={locale} />}
    </div>
  );
}
`;

const newContent = content.substring(0, returnStart) + dataObj + returnContent;

fs.writeFileSync('components/dashboard/AnalyticsView.tsx', newContent);
console.log("Replaced analytics return!");
