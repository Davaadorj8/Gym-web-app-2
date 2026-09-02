const fs = require('fs');

const inventoryPath = 'components/dashboard/InventoryView.tsx';
let content = fs.readFileSync(inventoryPath, 'utf8');

const startIdx = content.indexOf('{/* 1. MEMBERSHIP PLAN BUILDER TAB */}');
const endIdx = content.indexOf('{/* 2. LOCKER MANAGEMENT TAB */}');

if (startIdx !== -1 && endIdx !== -1) {
  let planBuilderContent = content.substring(startIdx, endIdx);
  
  // Let's create the component file
  const componentStr = `
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input, Badge } from '@/components/ui';
import { Trash2, Building2, UserCheck, Sparkles, Layers, DollarSign, Plus } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useDashboard } from '@/lib/orchestration';
import { CategoryTarget } from '@/lib/types';

interface MembershipPlanBuilderTabProps {
  showToast: (msg: string) => void;
}

export function MembershipPlanBuilderTab({ showToast }: MembershipPlanBuilderTabProps) {
  const t = useTranslations('Inventory');
  const dashboard = useDashboard();
  const plans = dashboard.plans;

  const [categoryTarget, setCategoryTarget] = useState<CategoryTarget>('over18');
  const [customTitle, setCustomTitle] = useState('');
  const [specializedLessons, setSpecializedLessons] = useState('');
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);

  const handleBuildPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (price <= 0 || durationMonths <= 0) {
      showToast('Price and Duration must be greater than zero.');
      return;
    }
    dashboard.addPlan({
      title: customTitle.trim() || 'Custom Plan',
      price,
      durationMonths,
      category: categoryTarget,
    });
    showToast(\`Successfully built '\${customTitle || 'Custom Plan'}'\`);
    // Reset
    setCustomTitle('');
    setSpecializedLessons('');
    setDurationMonths(1);
    setPrice(0);
  };

  const handleDeletePlan = (id: string) => {
    dashboard.deletePlan(id);
    showToast('Plan deleted.');
  };

  const getCategoryBadgeVariant = (cat: string) => {
    switch (cat) {
      case 'under18': return 'secondary';
      case 'organization': return 'warning';
      default: return 'primary';
    }
  };

  const getCategoryBadgeLabel = (cat: string) => {
    switch (cat) {
      case 'under18': return 'Under 18';
      case 'organization': return 'Organization';
      default: return 'Over 18 (Adult)';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
` + planBuilderContent + `
    </div>
  );
}
`;
  
  // Replace the inner contents (excluding the outer div we just added, wait, planBuilderContent already has elements)
  // Actually, planBuilderContent is just JSX elements. Let's make sure it's valid inside the wrapper.
  // We need to write this to a file and check.
  
  fs.writeFileSync('components/dashboard/inventory/MembershipPlanBuilderTab.tsx', componentStr);
  console.log('Extracted MembershipPlanBuilderTab');
}
