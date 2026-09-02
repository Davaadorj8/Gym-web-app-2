const fs = require('fs');
const content = fs.readFileSync('components/dashboard/AnalyticsView.tsx', 'utf8');

const hookStart = content.indexOf('const dashboard = useDashboard();');
const hookEnd = content.indexOf('  return (\n    <div id="analytics-view-root"');

const hookContent = content.substring(hookStart, hookEnd);

fs.writeFileSync('analytics-hook-content.txt', hookContent);
