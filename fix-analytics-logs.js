const fs = require('fs');
let content = fs.readFileSync('components/dashboard/AnalyticsView.tsx', 'utf8');

// The functions expect LockerLog[], which has a timestamp
content = content.replace(/logs: AuditRecord\[\]/g, "logs: any[]");

// The call site should pass dashboard.lockerLogs
content = content.replace("return calculateWeeklyDistribution(members);", "return calculateWeeklyDistribution(dashboard.lockerLogs || []);");
content = content.replace("return calculateHourlyTraffic(members);", "return calculateHourlyTraffic(dashboard.lockerLogs || []);");

fs.writeFileSync('components/dashboard/AnalyticsView.tsx', content);
