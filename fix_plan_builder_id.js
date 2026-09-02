const fs = require('fs');
const tabPath = 'components/dashboard/inventory/MembershipPlanBuilderTab.tsx';
let content = fs.readFileSync(tabPath, 'utf8');

const replacement = `
    const uniqueId = typeof window !== 'undefined' && window.crypto ? window.crypto.randomUUID() : Date.now().toString();
    const finalTitle = customTitle.trim() || 'Custom Plan';
    dashboard.addPlan({
      id: \`plan-\${uniqueId}\`,
      title: finalTitle,
      price,
      durationMonths,
      categoryTarget,
    });
`;

content = content.replace(
  /dashboard\.addPlan\(\{\s*title: customTitle\.trim\(\) \|\| 'Custom Plan',\s*price,\s*durationMonths,\s*categoryTarget,\s*\}\);/,
  replacement.trim()
);

fs.writeFileSync(tabPath, content);
