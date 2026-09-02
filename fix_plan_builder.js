const fs = require('fs');

const tabPath = 'components/dashboard/inventory/MembershipPlanBuilderTab.tsx';
let content = fs.readFileSync(tabPath, 'utf8');

// Fix imports
content = content.replace(
  "import { Trash2, Building2, UserCheck, Sparkles, Layers, DollarSign, Plus } from 'lucide-react';",
  "import { Trash2, Building2, UserCheck, Sparkles, Layers, DollarSign, Plus, Package, Award } from 'lucide-react';"
);

// Fix BuiltPlan creation
content = content.replace(
  "category: categoryTarget,",
  "categoryTarget,"
);

// Fix isAdmin
content = content.replace(
  "const plans = dashboard.plans;",
  "const plans = dashboard.plans;\n  const currentUser = dashboard.currentUser;\n  const isAdmin = !currentUser || currentUser.role === 'admin';"
);

// Remove activeTab check
const activeTabCheck = "{activeTab === 'plan-builder' && (";
const activeTabStart = content.indexOf(activeTabCheck);
if (activeTabStart !== -1) {
  content = content.substring(0, activeTabStart) + content.substring(activeTabStart + activeTabCheck.length);
  // Also remove the closing `)}` at the very end
  content = content.replace(/\)\}\s*<\/div>\s*\)\s*;\s*\}\s*$/, "</div>\n  );\n}\n");
}

fs.writeFileSync(tabPath, content);
