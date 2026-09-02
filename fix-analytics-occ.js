const fs = require('fs');
let content = fs.readFileSync('components/dashboard/AnalyticsView.tsx', 'utf8');

const newOcc = `
function calculateOccupancyMetrics(totalLockers: number, activeOccupantsCount: number, customStatuses: Record<string, LockerCustomStatus>) {
  let outOfServiceCount = 0;
  if (customStatuses) {
    Object.values(customStatuses).forEach(status => {
      if (status !== 'available' && status !== 'occupied') {
        outOfServiceCount++;
      }
    });
  }
  const occupiedCount = activeOccupantsCount;
  const availableCount = Math.max(0, totalLockers - occupiedCount - outOfServiceCount);
  const occupancyRate = totalLockers > 0 ? Math.round((occupiedCount / totalLockers) * 100) : 0;
  return { totalLockers, availableCount, occupiedCount, outOfServiceCount, occupancyRate };
}
`;

content = content.replace(
  /function calculateOccupancyMetrics\(members: GymMember\[\], lockerStatuses: Record<string, LockerCustomStatus>\) \{[\s\S]*?return \{ activeOccupants, statusCounts \};\n\}/,
  newOcc.trim()
);

content = content.replace(
  "dashboard.lockerStatuses",
  "dashboard.customLockerStatuses"
);

fs.writeFileSync('components/dashboard/AnalyticsView.tsx', content);
