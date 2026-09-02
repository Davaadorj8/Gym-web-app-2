const fs = require('fs');

const tabPath = 'components/dashboard/inventory/LockerManagementTab.tsx';
let content = fs.readFileSync(tabPath, 'utf8');

const componentStr = `
import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input, Badge } from '@/components/ui';
import { Check, X, KeyRound, Wrench, Search, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboard } from '@/lib/orchestration';
import { LockerCustomStatus } from '@/lib/types';

interface LockerManagementTabProps {
  showToast: (msg: string) => void;
}

const statusLabels: Record<LockerCustomStatus, string> = {
  clean: 'Clean / Ready',
  repair: 'Needs Repair',
  key_lost: 'Key Lost',
  key_not_returned: 'Key Not Returned',
  inactive: 'Inactive / Broken',
  available: 'Available',
  occupied: 'Occupied'
};

const statusColors: Record<LockerCustomStatus, { bg: string; text: string; border: string }> = {
  clean: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  repair: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  key_lost: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  key_not_returned: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  inactive: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
  available: { bg: 'bg-[#D4FF00]/10', text: 'text-[#D4FF00]', border: 'border-[#D4FF00]/30' },
  occupied: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' }
};

const generateLockerList = (count: number) => {
  return Array.from({ length: count }, (_, i) => \`Locker #\${(i + 1).toString().padStart(2, '0')}\`);
};

export function LockerManagementTab({ showToast }: LockerManagementTabProps) {
  const t = useTranslations('Inventory');
  const dashboard = useDashboard();
  const totalLockers = dashboard.totalLockers;
  
  const [lockerCount, setLockerCount] = useState<number>(totalLockers);
  const [lockerSaved, setLockerSaved] = useState(false);
  
  const [targetLockerNumber, setTargetLockerNumber] = useState<string>('Locker #01');
  const [targetStatus, setTargetStatus] = useState<LockerCustomStatus>('clean');
  const [statusNotes, setStatusNotes] = useState<string>('');
  
  const [lockerSearchQuery, setLockerSearchQuery] = useState<string>('');
  const [gridFilterStatus, setGridFilterStatus] = useState<LockerCustomStatus | 'all'>('all');

  const lockerList = useMemo(() => {
    return generateLockerList(totalLockers);
  }, [totalLockers]);

  const occupiedLockerMap = useMemo(() => {
    const map = new Map<string, string>();
    dashboard.members.forEach((m) => {
      if (m.occupancyStatus === 'Checked In' && m.assignedLocker) {
        map.set(m.assignedLocker, \`\${m.firstName} \${m.lastName}\`.trim());
      }
    });
    return map;
  }, [dashboard.members]);

  const handleUpdateLockerStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLockerNumber) return;
    dashboard.updateLockerStatus(targetLockerNumber, targetStatus);
    showToast(\`\${targetLockerNumber} status updated to "\${statusLabels[targetStatus]}"\`);
    setStatusNotes('');
  };

  const handleSaveLockerCapacity = (e: React.FormEvent) => {
    e.preventDefault();
    dashboard.setTotalLockers(lockerCount);
    setLockerSaved(true);
    showToast(t('lockerCapacitySaved') || 'Locker capacity saved');
    setTimeout(() => setLockerSaved(false), 2500);
  };

  const filteredLockerGrid = useMemo(() => {
    return lockerList.filter((num) => {
      if (lockerSearchQuery && !num.toLowerCase().includes(lockerSearchQuery.toLowerCase())) {
        return false;
      }
      const occupant = occupiedLockerMap.get(num) || '';
      const customStatus = dashboard.lockerStatuses?.[num] || 'clean';
      let derivedStatus: LockerCustomStatus = customStatus;
      if (occupant) {
        derivedStatus = 'occupied';
      } else if (customStatus === 'clean') {
        derivedStatus = 'available';
      }
      if (gridFilterStatus !== 'all' && derivedStatus !== gridFilterStatus) {
        return false;
      }
      return true;
    });
  }, [lockerList, lockerSearchQuery, gridFilterStatus, occupiedLockerMap, dashboard.lockerStatuses]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
` + content + `
    </div>
  );
}
`;

fs.writeFileSync(tabPath, componentStr);
