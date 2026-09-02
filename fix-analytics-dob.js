const fs = require('fs');
let content = fs.readFileSync('components/dashboard/AnalyticsView.tsx', 'utf8');

content = content.replace(/member\.dateOfBirth/g, "member.dob");
content = content.replace(/member\.organizationName/g, "member.orgName");

fs.writeFileSync('components/dashboard/AnalyticsView.tsx', content);
