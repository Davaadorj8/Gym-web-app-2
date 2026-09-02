const fs = require('fs');
let content = fs.readFileSync('components/dashboard/AnalyticsView.tsx', 'utf8');

const newAgg = `
function aggregateExtensionMetrics(members: GymMember[]) {
  const allLogs: any[] = [];
  const categoryBreakdown = {
    under18: { count: 0, revenue: 0 },
    over18: { count: 0, revenue: 0 },
    organization: { count: 0, revenue: 0 },
  };
  const periodBreakdown = {
    m1: { count: 0, pct: 0 },
    m3: { count: 0, pct: 0 },
    m6: { count: 0, pct: 0 },
    m12: { count: 0, pct: 0 },
    other: { count: 0, pct: 0 },
  };
  let totalRevenue = 0;
  const extendedMembers = new Set<string>();

  members.forEach(m => {
    if (m.extensionHistory && m.extensionHistory.length > 0) {
      extendedMembers.add(m.id);
      const cat = resolveMemberCategory(m);
      m.extensionHistory.forEach(ext => {
        const log = {
          ...ext,
          memberId: m.id,
          memberName: getMemberFullName(m),
          memberCategory: cat,
        };
        allLogs.push(log);
        totalRevenue += ext.feePaid;
        
        if (categoryBreakdown[cat]) {
          categoryBreakdown[cat].count++;
          categoryBreakdown[cat].revenue += ext.feePaid;
        }

        const months = ext.monthsAdded;
        if (months === 1) periodBreakdown.m1.count++;
        else if (months === 3) periodBreakdown.m3.count++;
        else if (months === 6) periodBreakdown.m6.count++;
        else if (months === 12) periodBreakdown.m12.count++;
        else periodBreakdown.other.count++;
      });
    }
  });

  const totalTransactions = allLogs.length;
  const uniqueMembersCount = extendedMembers.size;
  const renewalPercentage = members.length > 0 ? Math.round((uniqueMembersCount / members.length) * 100) + '%' : '0%';
  
  if (totalTransactions > 0) {
    periodBreakdown.m1.pct = Math.round((periodBreakdown.m1.count / totalTransactions) * 100);
    periodBreakdown.m3.pct = Math.round((periodBreakdown.m3.count / totalTransactions) * 100);
    periodBreakdown.m6.pct = Math.round((periodBreakdown.m6.count / totalTransactions) * 100);
    periodBreakdown.m12.pct = Math.round((periodBreakdown.m12.count / totalTransactions) * 100);
    periodBreakdown.other.pct = Math.round((periodBreakdown.other.count / totalTransactions) * 100);
  }

  let topPeriodLabel = '1 Month';
  let maxCount = periodBreakdown.m1.count;
  if (periodBreakdown.m3.count > maxCount) { maxCount = periodBreakdown.m3.count; topPeriodLabel = '3 Months'; }
  if (periodBreakdown.m6.count > maxCount) { maxCount = periodBreakdown.m6.count; topPeriodLabel = '6 Months'; }
  if (periodBreakdown.m12.count > maxCount) { maxCount = periodBreakdown.m12.count; topPeriodLabel = '12 Months'; }

  return {
    allLogs,
    uniqueMembersCount,
    renewalPercentage,
    totalTransactions,
    totalRevenue,
    topPeriodLabel,
    categoryBreakdown,
    periodBreakdown
  };
}
`;

const startStr = "function aggregateExtensionMetrics(members: GymMember[]) {";
const startIdx = content.indexOf(startStr);

if (startIdx !== -1) {
  let endIdx = content.indexOf("function calculateOccupancyMetrics", startIdx);
  if (endIdx !== -1) {
    content = content.substring(0, startIdx) + newAgg + "\n" + content.substring(endIdx);
    fs.writeFileSync('components/dashboard/AnalyticsView.tsx', content);
    console.log("Replaced aggregateExtensionMetrics");
  }
}
