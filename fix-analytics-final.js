const fs = require('fs');
let content = fs.readFileSync('components/dashboard/AnalyticsView.tsx', 'utf8');

// Fix planId
content = content.replace(/member\.planId/g, "member.planTitle");
content = content.replace(/m\.planId/g, "m.planTitle");

// Fix ext.feePaid possibly undefined
content = content.replace(/ext\.feePaid/g, "(ext.feePaid || 0)");

// Fix customLockerStatuses
content = content.replace(/dashboard\.customLockerStatuses/g, "dashboard.lockerStatuses");

// Fix 'plan' -> 'plans' and 'locker' -> 'lockers'
content = content.replace(/'plan'/g, "'plans'");
content = content.replace(/'locker'/g, "'lockers'");

fs.writeFileSync('components/dashboard/AnalyticsView.tsx', content);
