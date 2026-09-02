const fs = require('fs');
let content = fs.readFileSync('components/dashboard/InventoryView.tsx', 'utf8');

const startMarker = "{/* Interactive Search, Filters & Batch Action Toolbar */}";
const endMarker = "{/* 4. SUPPLIERS & PURCHASE ORDERS TAB */}";

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + "              </div>\n            )}\n          </div>\n        </div>\n      )}\n\n      " + content.substring(endIdx);
  fs.writeFileSync('components/dashboard/InventoryView.tsx', content);
  console.log("Cleaned up redundant nutrients code");
}
