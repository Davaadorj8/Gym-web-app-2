'use client';

import React, { useState } from 'react';
import { KeyRound, Check } from 'lucide-react';

interface LockerCapacityCardProps {
  totalLockers: number;
  onSaveTotalLockers: (count: number) => void;
  showToast: (msg: string) => void;
}

export function LockerCapacityCard({
  totalLockers,
  onSaveTotalLockers,
  showToast,
}: LockerCapacityCardProps) {
  const [lockerCount, setLockerCount] = useState<number>(totalLockers);
  // totalLockers now resolves asynchronously (fetched from the server on mount), so it can
  // change after this component's local state was first initialized. Adjust state directly
  // during render (React's recommended pattern for this) rather than in an effect, which
  // would cause an extra render pass.
  const [prevTotalLockers, setPrevTotalLockers] = useState(totalLockers);
  if (totalLockers !== prevTotalLockers) {
    setPrevTotalLockers(totalLockers);
    setLockerCount(totalLockers);
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const count = Math.max(1, Math.min(200, lockerCount));
    onSaveTotalLockers(count);
    showToast(`Locker capacity updated to ${count} total units.`);
  };

  return (
    <div className="bg-[#070D1E] border border-border/80 rounded-xl p-4 space-y-3 font-sans">
      <div className="flex items-center gap-2 border-b border-border/80 pb-2.5 font-mono">
        <KeyRound className="w-4 h-4 text-[#D4FF00]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Total Locker Installation Capacity
        </h3>
      </div>

      <form onSubmit={handleSave} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-mono text-xs">
        <div className="space-y-1 flex-1">
          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Installed Lockers Count
          </label>
          <input
            type="number"
            min="1"
            max="200"
            value={lockerCount}
            onChange={(e) => setLockerCount(Number(e.target.value))}
            className="w-full bg-[#0B132B] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-3 py-2 outline-none font-mono"
          />
        </div>

        <button
          type="submit"
          className="bg-[#D4FF00] hover:bg-[#c3eb00] text-black font-extrabold text-xs px-4 py-2.5 rounded-lg cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5 font-mono self-end"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Save Capacity</span>
        </button>
      </form>
    </div>
  );
}
