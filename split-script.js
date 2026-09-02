const fs = require('fs');

const content = fs.readFileSync('components/dashboard/InventoryView.tsx', 'utf8');

// The file has comments:
// {/* 1. MEMBERSHIP PLAN BUILDER TAB */}
// {/* 2. LOCKER MANAGEMENT TAB */}
// {/* 3. NUTRIENTS TAB */}
// {/* 4. SUPPLIERS & PURCHASE ORDERS TAB */}
// {/* Add Plan Modal */}

const p1 = content.indexOf("{/* 1. MEMBERSHIP PLAN BUILDER TAB */}");
const p2 = content.indexOf("{/* 2. LOCKER MANAGEMENT TAB */}");
const p3 = content.indexOf("{/* 3. NUTRIENTS TAB */}");
const p4 = content.indexOf("{/* 4. SUPPLIERS & PURCHASE ORDERS TAB */}");
const p5 = content.indexOf("{/* Add Plan Modal */}");

const planBuilderStr = content.substring(p1, p2);
const lockerStr = content.substring(p2, p3);
const nutrientsStr = content.substring(p3, p4);
const poStr = content.substring(p4, p5);

fs.writeFileSync('plan-builder.txt', planBuilderStr);
fs.writeFileSync('locker.txt', lockerStr);
fs.writeFileSync('nutrients.txt', nutrientsStr);
fs.writeFileSync('po.txt', poStr);
fs.writeFileSync('modals.txt', content.substring(p5));

console.log("Extracted parts!");
