'use client';

import React, { useState } from 'react';
import { Wrench, Check } from 'lucide-react';
import { LockerCustomStatus } from '@/features/lockers';

interface LockerStatusUpdateFormProps {
  totalLockers: number;
  onUpdateLockerStatus: (lockerNum: string, status: LockerCustomStatus, notes?: string) => void;
  showToast: (msg: string) => void;
}

export function LockerStatusUpdateForm({
  totalLockers,
  onUpdateLockerStatus,
  showToast,
}: LockerStatusUpdateFormProps) {
  const [targetLockerNumber, setTargetLockerNumber] = useState<string>('Locker #01');
  const [targetStatus, setTargetStatus] = useState<LockerCustomStatus>('clean');
  const [statusNotes, setStatusNotes] = useState<string>('');

  const lockerOptions = Array.from(
    { length: totalLockers },
    (_, i) => `Locker #${(i + 1).toString().padStart(2, '0')}`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateLockerStatus(targetLockerNumber, targetStatus, statusNotes);
    showToast(`Updated ${targetLockerNumber} status to ${targetStatus}.`);
    setStatusNotes('');
  };

  return (
    <div className="bg-[#070D1E] border border-border/80 rounded-xl p-4 space-y-3 font-sans">
      <div className="flex items-center gap-2 border-b border-border/80 pb-2.5 font-mono">
        <Wrench className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Update Locker Maintenance / Custom Status
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Select Target Locker
            </label>
            <select
              value={targetLockerNumber}
              onChange={(e) => setTargetLockerNumber(e.target.value)}
              className="w-full bg-[#0B132B] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-2.5 py-2 outline-none font-mono"
            >
              {lockerOptions.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Target Status Flag
            </label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as LockerCustomStatus)}
              className="w-full bg-[#0B132B] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-2.5 py-2 outline-none font-mono"
            >
              <option value="available">Available / Clear</option>
              <option value="clean">Needs Cleaning</option>
              <option value="repair">Needs Repair / Maintenance</option>
              <option value="key_lost">Key Lost</option>
              <option value="key_not_returned">Key Not Returned</option>
              <option value="inactive">Inactive / Out of Service</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Maintenance Notes
          </label>
          <input
            type="text"
            placeholder="e.g. Hinge repair, key replacement ordered..."
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            className="w-full bg-[#0B132B] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-3 py-2 outline-none font-sans"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="bg-[#D4FF00] hover:bg-[#c3eb00] text-black font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-md transition-all flex items-center gap-1.5 font-mono"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Update Locker Flag</span>
          </button>
        </div>
      </form>
    </div>
  );
}
