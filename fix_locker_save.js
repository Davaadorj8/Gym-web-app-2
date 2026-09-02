const fs = require('fs');

let content = fs.readFileSync('components/dashboard/inventory/LockerManagementTab.tsx', 'utf8');

content = content.replace(
  /if \(typeof dashboard\.updateTotalLockers === 'function'\) \{\s*dashboard\.updateTotalLockers\(lockerCount\);\s*\} else if \(typeof \(dashboard as any\)\.setTotalLockers === 'function'\) \{\s*\(dashboard as any\)\.setTotalLockers\(lockerCount\);\s*\}/,
  "if (typeof dashboard.saveTotalLockers === 'function') { dashboard.saveTotalLockers(lockerCount); }"
);

fs.writeFileSync('components/dashboard/inventory/LockerManagementTab.tsx', content);
