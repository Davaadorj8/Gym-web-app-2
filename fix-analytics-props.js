const fs = require('fs');
let content = fs.readFileSync('components/dashboard/AnalyticsView.tsx', 'utf8');

content = content.replace("const members = propMembers ?? dashboard.members;", "const members = dashboard.members;");
content = content.replace("const plans = propPlans ?? dashboard.plans;", "const plans = dashboard.plans;");
content = content.replace("const currentUser = propCurrentUser ?? dashboard.currentUser;", "const currentUser = dashboard.currentUser;");

fs.writeFileSync('components/dashboard/AnalyticsView.tsx', content);
