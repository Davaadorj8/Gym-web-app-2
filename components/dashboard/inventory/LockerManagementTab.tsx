
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
  return Array.from({ length: count }, (_, i) => `Locker #${(i + 1).toString().padStart(2, '0')}`);
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
        map.set(m.assignedLocker, `${m.firstName} ${m.lastName}`.trim());
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
    showToast(`${targetLockerNumber} status updated to "${statusLabels[targetStatus]}"`);
    setStatusNotes('');
  };

  const handleSaveLockers = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof dashboard.saveTotalLockers === 'function') { dashboard.saveTotalLockers(lockerCount); }
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
      {/* 2. LOCKER MANAGEMENT TAB */}
      
        <div
          id="card-locker-capacity"
          className="bg-[#0B132B]/80 dark:bg-[#0D1527] border border-border/80 rounded-2xl p-6 sm:p-7 space-y-8 shadow-xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#070D1E] border border-border/80 flex items-center justify-center shrink-0 text-[#D4FF00]">
                <Lock className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                  {t('lockerCapTitle')} &amp; Status Management
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure total gym locker capacity, assign maintenance states, report lost keys, and manage operational status.
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Total Gym Capacity Configuration */}
          <div id="section-capacity-config" className="space-y-3 bg-[#070D1E]/60 border border-border/70 rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 text-[#D4FF00] font-mono font-bold text-xs tracking-wider uppercase">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4FF00]" />
              <span>Locker Capacity Settings</span>
            </div>

            <form onSubmit={handleSaveLockers} className="space-y-3 pt-1">
              <label
                htmlFor="input-total-lockers"
                className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono"
              >
                {t('totalGymLockersLabel')}
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <input
                    id="input-total-lockers"
                    type="number"
                    min="1"
                    max="200"
                    value={lockerCount}
                    onChange={(e) => setLockerCount(Number(e.target.value))}
                    required
                    className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] focus:ring-1 focus:ring-[#D4FF00] text-sm text-foreground font-mono rounded-xl px-4 py-2.5 outline-none transition-all"
                  />
                </div>

                <button
                  id="btn-save-lockers"
                  type="submit"
                  className="h-10 bg-[#D4FF00] hover:bg-[#c3eb00] text-black font-extrabold text-xs tracking-wider px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4FF00]/10 active:scale-[0.99]"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{lockerSaved ? 'Saved!' : t('saveLockerBtn')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Real-time Status Overview Pills */}
          <div id="section-locker-status-overview" className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              <span>Current Status Metrics ({statusSummary.total} Lockers)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              <div className="bg-[#070D1E] border border-border/80 rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-mono text-muted-foreground block uppercase">Total</span>
                <span className="text-base font-extrabold font-mono text-foreground">{statusSummary.total}</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-mono text-emerald-400 block uppercase">Available</span>
                <span className="text-base font-extrabold font-mono text-emerald-400">{statusSummary.available}</span>
              </div>
              <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-mono text-sky-400 block uppercase">Occupied</span>
                <span className="text-base font-extrabold font-mono text-sky-400">{statusSummary.occupied}</span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-mono text-amber-400 block uppercase">Clean</span>
                <span className="text-base font-extrabold font-mono text-amber-400">{statusSummary.clean}</span>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-mono text-orange-400 block uppercase">Repair Fix</span>
                <span className="text-base font-extrabold font-mono text-orange-400">{statusSummary.repair}</span>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-mono text-rose-400 block uppercase">Key Lost</span>
                <span className="text-base font-extrabold font-mono text-rose-400">{statusSummary.keyLost}</span>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-mono text-purple-400 block uppercase font-sans">Key Overdue</span>
                <span className="text-base font-extrabold font-mono text-purple-400">{statusSummary.keyNotReturned}</span>
              </div>
              <div className="bg-slate-500/10 border border-slate-500/30 rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Inactive</span>
                <span className="text-base font-extrabold font-mono text-slate-400">{statusSummary.inactive}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Update Specific Locker Status Form */}
          <div id="section-update-locker-status" className="bg-[#070D1E]/80 border border-border/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#D4FF00] font-mono font-bold text-xs tracking-wider uppercase">
              <Wrench className="w-4 h-4 text-[#D4FF00]" />
              <span>Update Locker Logic &amp; Status</span>
            </div>

            <form onSubmit={handleUpdateLockerStatus} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* Target Locker Selector */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
                    Select Locker Number
                  </label>
                  <select
                    value={targetLockerNumber}
                    onChange={(e) => setTargetLockerNumber(e.target.value)}
                    className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-sm font-mono text-foreground rounded-xl px-3.5 py-2.5 outline-none"
                  >
                    {lockerList.map((num) => {
                      const cfg = getLockerStatusConfig(num);
                      return (
                        <option key={num} value={num}>
                          {num} - [{cfg.label}]
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Status Selection Buttons */}
                <div className="md:col-span-8 space-y-1.5">
                  <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
                    New Locker Status
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetStatus('clean')}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer text-left',
                        targetStatus === 'clean'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                          : 'bg-[#070D1E] border-border/70 text-muted-foreground hover:text-foreground hover:border-amber-500/50'
                      )}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Clean / Needs Cleaning</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetStatus('repair')}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer text-left',
                        targetStatus === 'repair'
                          ? 'bg-orange-500/20 border-orange-500 text-orange-300 ring-1 ring-orange-500'
                          : 'bg-[#070D1E] border-border/70 text-muted-foreground hover:text-foreground hover:border-orange-500/50'
                      )}
                    >
                      <Wrench className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>Repair / Fix Needed</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetStatus('key_lost')}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer text-left',
                        targetStatus === 'key_lost'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-1 ring-rose-500'
                          : 'bg-[#070D1E] border-border/70 text-muted-foreground hover:text-foreground hover:border-rose-500/50'
                      )}
                    >
                      <KeyRound className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Key Lost</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetStatus('key_not_returned')}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer text-left',
                        targetStatus === 'key_not_returned'
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300 ring-1 ring-purple-500'
                          : 'bg-[#070D1E] border-border/70 text-muted-foreground hover:text-foreground hover:border-purple-500/50'
                      )}
                    >
                      <Key className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Key Not Returned</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetStatus('inactive')}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer text-left',
                        targetStatus === 'inactive'
                          ? 'bg-slate-500/20 border-slate-500 text-slate-300 ring-1 ring-slate-500'
                          : 'bg-[#070D1E] border-border/70 text-muted-foreground hover:text-foreground hover:border-slate-500/50'
                      )}
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Inactive</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetStatus('available')}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer text-left',
                        targetStatus === 'available'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                          : 'bg-[#070D1E] border-border/70 text-muted-foreground hover:text-foreground hover:border-emerald-500/50'
                      )}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Available</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes & Submit Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
                <div className="sm:col-span-8 space-y-1">
                  <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
                    Status Notes / Repair Details (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lock mechanism replaced, key reissued, door misaligned..."
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground placeholder:text-muted-foreground/50 rounded-xl px-3.5 py-2.5 outline-none"
                  />
                </div>

                <div className="sm:col-span-4">
                  <button
                    type="submit"
                    className="w-full h-10 bg-[#D4FF00] hover:bg-[#c3eb00] text-black font-extrabold text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4FF00]/10 active:scale-[0.99]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Apply Status Change</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Section 4: Interactive Floor Grid */}
          <div id="section-locker-grid-inventory" className="space-y-4 pt-2 border-t border-border/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-foreground">Interactive Locker Status Grid</h3>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Click any locker to select it for quick status update. Showing {filteredLockerGrid.length} of {lockerList.length} lockers.
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search locker #..."
                    value={lockerSearchQuery}
                    onChange={(e) => setLockerSearchQuery(e.target.value)}
                    className="bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs font-mono text-foreground placeholder:text-muted-foreground/60 rounded-xl pl-8 pr-3 py-1.5 outline-none w-36 sm:w-44"
                  />
                </div>

                <select
                  value={gridFilterStatus}
                  onChange={(e) => setGridFilterStatus(e.target.value as any)}
                  className="bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs font-mono text-foreground rounded-xl px-2.5 py-1.5 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="clean">Clean / Needs Cleaning</option>
                  <option value="repair">Repair Fix Needed</option>
                  <option value="key_lost">Key Lost</option>
                  <option value="key_not_returned">Key Not Returned</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2.5 max-h-[420px] overflow-y-auto p-1 pr-2">
              {filteredLockerGrid.map((num) => {
                const cfg = getLockerStatusConfig(num);
                const occupant = occupiedLockerMap.get(num);
                const isSelected = targetLockerNumber === num;
                const StatusIcon = cfg.icon;

                return (
                  <div
                    key={num}
                    onClick={() => setTargetLockerNumber(num)}
                    className={cn(
                      'p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1.5 select-none relative group',
                      cfg.bg,
                      isSelected ? 'ring-2 ring-[#D4FF00] scale-[1.03] z-10' : 'hover:scale-[1.02]'
                    )}
                  >
                    <span className="text-[11px] font-mono font-bold text-foreground tracking-tight">
                      {num.replace('Locker #', '#')}
                    </span>

                    <StatusIcon className="w-4 h-4 shrink-0" />

                    <div className={cn('px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase truncate max-w-full', cfg.badgeBg)}>
                      {cfg.label}
                    </div>

                    {occupant && (
                      <span className="text-[9px] text-muted-foreground font-mono truncate max-w-full" title={occupant}>
                        {occupant}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      

      
    </div>
  );
}
