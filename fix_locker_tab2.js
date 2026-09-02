const fs = require('fs');

let content = fs.readFileSync('components/dashboard/inventory/LockerManagementTab.tsx', 'utf8');

// Replace the unmatched opening
content = content.replace(/\{activeTab === 'locker-management' && \(/g, "");

// Write back
fs.writeFileSync('components/dashboard/inventory/LockerManagementTab.tsx', content);
