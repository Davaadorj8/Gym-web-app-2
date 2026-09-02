const fs = require('fs');

let content = fs.readFileSync('components/dashboard/InventoryView.tsx', 'utf8');

const startIdx = content.indexOf('{/* 2. LOCKER MANAGEMENT TAB */}');
const endIdx = content.indexOf('{/* 3. NUTRIENTS TAB */}');

if (startIdx !== -1 && endIdx !== -1) {
  let jsxPart = content.substring(startIdx, endIdx);
  
  let cleanJsx = jsxPart.replace(/\{activeTab === 'locker' && \(/, "");
  cleanJsx = cleanJsx.replace(/handleSaveLockerCapacity/g, "handleSaveLockers");
  cleanJsx = cleanJsx.replace(/handleUpdateSingleLockerStatus/g, "handleUpdateLockerStatus");
  cleanJsx = cleanJsx.replace(/<Lock className/g, "<Lock className");

  // Remove the trailing )}
  const lastBracket = cleanJsx.lastIndexOf(')}');
  if (lastBracket !== -1) {
    cleanJsx = cleanJsx.substring(0, lastBracket) + cleanJsx.substring(lastBracket + 2);
  }

  const newTab = `
import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input, Badge } from '@/components/ui';
import { 
  Check, X, KeyRound, Wrench, Search, AlertCircle, 
  Sparkles, Key, CheckCircle2, RefreshCw, UserCheck, Lock, SlidersHorizontal 
} from 'lucide-react';
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

  const getLockerStatusConfig = React.useCallback(
    (lockerNum: string) => {
      const isOccupied = occupiedLockerMap.has(lockerNum);
      const customStatus = dashboard.lockerStatuses[lockerNum];

      if (customStatus && customStatus !== 'available') {
        switch (customStatus) {
          case 'clean':
            return {
              label: 'Needs Cleaning',
              bg: 'bg-amber-500/10 border-amber-500/40 text-amber-400',
              badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
              icon: Sparkles,
              code: 'clean' as LockerCustomStatus,
            };
          case 'repair':
            return {
              label: 'Needs Repair / Fix',
              bg: 'bg-orange-500/10 border-orange-500/40 text-orange-400',
              badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
              icon: Wrench,
              code: 'repair' as LockerCustomStatus,
            };
          case 'key_lost':
            return {
              label: 'Key Lost',
              bg: 'bg-rose-500/10 border-rose-500/40 text-rose-400',
              badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
              icon: KeyRound,
              code: 'key_lost' as LockerCustomStatus,
            };
          case 'key_not_returned':
            return {
              label: 'Key Not Returned',
              bg: 'bg-purple-500/10 border-purple-500/40 text-purple-400',
              badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
              icon: Key,
              code: 'key_not_returned' as LockerCustomStatus,
            };
          case 'inactive':
            return {
              label: 'Inactive',
              bg: 'bg-slate-500/10 border-slate-500/40 text-slate-400',
              badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
              icon: AlertCircle,
              code: 'inactive' as LockerCustomStatus,
            };
          case 'occupied':
            return {
              label: 'Occupied',
              bg: 'bg-sky-500/10 border-sky-500/40 text-sky-400',
              badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
              icon: UserCheck,
              code: 'occupied' as LockerCustomStatus,
            };
        }
      }

      if (isOccupied) {
        return {
          label: 'Occupied',
          bg: 'bg-sky-500/10 border-sky-500/40 text-sky-400',
          badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
          icon: UserCheck,
          code: 'occupied' as LockerCustomStatus,
        };
      }

      return {
        label: 'Available',
        bg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        icon: CheckCircle2,
        code: 'available' as LockerCustomStatus,
      };
    },
    [occupiedLockerMap, dashboard.lockerStatuses]
  );

  const statusSummary = useMemo(() => {
    let clean = 0;
    let repair = 0;
    let keyLost = 0;
    let keyNotReturned = 0;
    let inactive = 0;
    let occupied = 0;
    let available = 0;

    lockerList.forEach((num) => {
      const isOccupied = occupiedLockerMap.has(num);
      const custom = dashboard.lockerStatuses[num];

      if (custom && custom !== 'available') {
        if (custom === 'clean') clean++;
        else if (custom === 'repair') repair++;
        else if (custom === 'key_lost') keyLost++;
        else if (custom === 'key_not_returned') keyNotReturned++;
        else if (custom === 'inactive') inactive++;
        else if (custom === 'occupied') occupied++;
      } else if (isOccupied) {
        occupied++;
      } else {
        available++;
      }
    });

    return {
      total: lockerList.length,
      available,
      occupied,
      clean,
      repair,
      keyLost,
      keyNotReturned,
      inactive,
    };
  }, [lockerList, occupiedLockerMap, dashboard.lockerStatuses]);

  const handleUpdateLockerStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLockerNumber) return;
    dashboard.updateLockerStatus(targetLockerNumber, targetStatus);
    showToast(\`\${targetLockerNumber} status updated to "\${statusLabels[targetStatus]}"\`);
    setStatusNotes('');
  };

  const handleSaveLockers = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof dashboard.updateTotalLockers === 'function') {
      dashboard.updateTotalLockers(lockerCount);
    } else if (typeof (dashboard as any).setTotalLockers === 'function') {
      (dashboard as any).setTotalLockers(lockerCount);
    }
    setLockerSaved(true);
    showToast(t('lockerCapacitySaved') || 'Locker capacity saved');
    setTimeout(() => setLockerSaved(false), 2500);
  };

  const filteredLockerGrid = useMemo(() => {
    return lockerList.filter((num) => {
      if (lockerSearchQuery.trim()) {
        const q = lockerSearchQuery.toLowerCase().trim();
        const cfg = getLockerStatusConfig(num);
        const occupant = occupiedLockerMap.get(num) || '';
        const matchNumber = num.toLowerCase().includes(q);
        const matchStatus = cfg.label.toLowerCase().includes(q);
        const matchOccupant = occupant.toLowerCase().includes(q);
        if (!matchNumber && !matchStatus && !matchOccupant) return false;
      }

      if (gridFilterStatus !== 'all') {
        const cfg = getLockerStatusConfig(num);
        if (cfg.code !== gridFilterStatus) return false;
      }

      return true;
    });
  }, [lockerList, lockerSearchQuery, gridFilterStatus, occupiedLockerMap, getLockerStatusConfig]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      ${cleanJsx}
    </div>
  );
}
`;

  fs.writeFileSync('components/dashboard/inventory/LockerManagementTab.tsx', newTab);
}

