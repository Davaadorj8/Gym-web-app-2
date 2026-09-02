const fs = require('fs');
let content = fs.readFileSync('components/dashboard/AnalyticsView.tsx', 'utf8');

// fix lucide-react imports
content = content.replace(
  "from 'lucide-react';",
  "Award, BarChart3, Database, Lock, AlertTriangle } from 'lucide-react';"
);

// fix Input import
content = content.replace(
  "import { Card, Badge } from '@/components/ui';",
  "import { Card, Badge, Input } from '@/components/ui';"
);

// fix "plan" vs "plans"
content = content.replace(/activeTab === 'plan'/g, "activeTab === 'plans'");
content = content.replace(/activeTab === 'locker'/g, "activeTab === 'lockers'");

// fix resolveMemberCategory and getMemberFullName
content = content.replace(
  "import { BuiltPlan, Member, AuditRecord, LockerCustomStatus } from '@/lib/types';",
  "import { BuiltPlan, Member, AuditRecord, LockerCustomStatus, resolveMemberCategory, getMemberFullName } from '@/lib/types';"
);

fs.writeFileSync('components/dashboard/AnalyticsView.tsx', content);
