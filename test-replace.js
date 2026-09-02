const fs = require('fs');
const content = fs.readFileSync('components/dashboard/DashboardShell.tsx', 'utf8');

const target = `            <h1 className="text-[clamp(1.25rem,1.8vw,1.75rem)] font-bold text-white tracking-tight">
              {activeTab === 'dashboard' || activeTab === 'analytics'
                ? locale === 'mn' ? 'Хяналтын самбар' : 'Analytics & Insights'
                : activeTab === 'directory'
                ? locale === 'mn' ? 'Гишүүдийн бүртгэл' : 'Member Directory'
                : activeTab === 'locker'
                ? locale === 'mn' ? 'Шүүгээний ашиглалт' : 'Locker Assignment'
                : activeTab === 'checkin-desk'
                ? locale === 'mn' ? 'Нэвтрэх хэсэг' : 'Check-In Desk'
                : activeTab === 'inventory'
                ? locale === 'mn' ? 'Бараа материалын бүртгэл' : 'Nutrient Inventory'
                : activeTab === 'approvals'
                ? locale === 'mn' ? 'Ажилтны зөвшөөрөл' : 'Staff Approvals'
                : locale === 'mn' ? 'Шинэ гишүүн бүртгэх' : 'Member Registration'}
            </h1>`;

const replace = `            <h1 className="text-[clamp(1.25rem,1.8vw,1.75rem)] font-bold text-white tracking-tight">
              {getTabMeta(activeTab, locale)}
            </h1>`;

const newContent = content.replace(target, replace);
if (content === newContent) {
  console.log("No replace made!");
} else {
  fs.writeFileSync('components/dashboard/DashboardShell.tsx', newContent);
  console.log("Replaced successfully!");
}
