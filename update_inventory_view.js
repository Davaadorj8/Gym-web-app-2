const fs = require('fs');

let content = fs.readFileSync('components/dashboard/InventoryView.tsx', 'utf8');

// We need to import the newly created tabs.
content = content.replace(
  "import { InventoryTable } from './inventory/InventoryTable';",
  `import { InventoryTable } from './inventory/InventoryTable';
import { MembershipPlanBuilderTab } from './inventory/MembershipPlanBuilderTab';
import { LockerManagementTab } from './inventory/LockerManagementTab';
import { SuppliersAndPOTab } from './inventory/SuppliersAndPOTab';`
);

// We need to remove the plan builder logic from InventoryView.tsx
const planStart = content.indexOf('{/* 1. MEMBERSHIP PLAN BUILDER TAB */}');
const planEnd = content.indexOf('{/* 2. LOCKER MANAGEMENT TAB */}');
if (planStart !== -1 && planEnd !== -1) {
  content = content.substring(0, planStart) + "{activeTab === 'plan-builder' && <MembershipPlanBuilderTab showToast={showToast} />}\n      " + content.substring(planEnd);
}

// We need to remove the locker logic from InventoryView.tsx
const lockerStart = content.indexOf('{/* 2. LOCKER MANAGEMENT TAB */}');
const lockerEnd = content.indexOf('{/* 3. NUTRIENTS TAB */}');
if (lockerStart !== -1 && lockerEnd !== -1) {
  content = content.substring(0, lockerStart) + "{activeTab === 'lockers' && <LockerManagementTab showToast={showToast} />}\n      " + content.substring(lockerEnd);
}

// We need to remove the suppliers logic from InventoryView.tsx
const supplierStart = content.indexOf('{/* 4. SUPPLIERS & PURCHASE ORDERS TAB */}');
const supplierEnd = content.indexOf('{/* Nutrient Creation Modal */}');
if (supplierStart !== -1 && supplierEnd !== -1) {
  content = content.substring(0, supplierStart) + "{activeTab === 'purchase-orders' && <SuppliersAndPOTab showToast={showToast} />}\n\n      " + content.substring(supplierEnd);
}

fs.writeFileSync('components/dashboard/InventoryView.tsx', content);
console.log("Updated InventoryView.tsx");
