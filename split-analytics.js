const fs = require('fs');
const content = fs.readFileSync('components/dashboard/AnalyticsView.tsx', 'utf8');

const t1 = content.indexOf('{/* ================= TAB 1: FINANCIAL ANALYTICS ================= */}');
const t2 = content.indexOf('{/* ================= TAB 2: OPERATIONAL ANALYTICS ================= */}');
const t3 = content.indexOf('{/* ================= TAB 3: PLAN (PRODUCT) ANALYTICS ================= */}');
const t4 = content.indexOf('{/* ================= TAB 4: NUTRIENT INVENTORY ANALYTICS ================= */}');
const t5 = content.indexOf('{/* ================= TAB 5: LOCKER ANALYTICS ================= */}');
const t6 = content.indexOf('{/* ================= TAB 5: MEMBERS ANALYTICS ================= */}'); // Wait, it says TAB 5 twice?
const end = content.lastIndexOf('</div>\n  );\n}');

fs.writeFileSync('tab1.txt', content.substring(t1, t2));
fs.writeFileSync('tab2.txt', content.substring(t2, t3));
fs.writeFileSync('tab3.txt', content.substring(t3, t4));
fs.writeFileSync('tab4.txt', content.substring(t4, t5));
fs.writeFileSync('tab5.txt', content.substring(t5, t6));
fs.writeFileSync('tab6.txt', content.substring(t6, end));

console.log("Analytics view split extracted.");
