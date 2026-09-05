'use client';

import React from 'react';
import { KeyRound, X, Check } from 'lucide-react';
import { GymMember } from '@/lib/types';
import { LockerCustomStatus, isLockerUnavailableStatus } from '@/features/lockers';

interface LockerAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMember: GymMember | null;
  totalLockers: number;
  occupiedLockers: Set<string>;
  lockerStatuses?: Record<string | number, LockerCustomStatus>;
  selectedLockerNumber: string;
  setSelectedLockerNumber: (num: string) => void;
  onConfirmCheckIn: () => void;
}

export function LockerAssignmentModal({
  isOpen,
  onClose,
  activeMember,
  totalLockers,
  occupiedLockers,
  lockerStatuses = {},
  selectedLockerNumber,
  setSelectedLockerNumber,
  onConfirmCheckIn,
}: LockerAssignmentModalProps) {
  if (!isOpen || !activeMember) return null;

  const lockerList = Array.from({ length: totalLockers }, (_, i) => (i + 1).toString());

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-[#0B132B] border border-border rounded-xl w-full max-w-lg p-4 sm:p-5 space-y-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#D4FF00]" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Assign Locker &amp; Check In</h3>
              <p className="text-[10px] text-muted-foreground font-mono">
                {activeMember.isOrganization && activeMember.orgName
                  ? activeMember.orgName
                  : `${activeMember.firstName} ${activeMember.lastName}`}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Select Locker Number
          </span>

          <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
            {lockerList.map((numStr) => {
              const numVal = parseInt(numStr, 10);
              const customStatus = lockerStatuses[numVal];
              const isOccupied = occupiedLockers.has(numStr);
              const isUnavailable = isLockerUnavailableStatus(customStatus) || isOccupied;
              const isSelected = selectedLockerNumber === numStr;

              return (
                <button
                  key={numStr}
                  type="button"
                  disabled={isUnavailable}
                  onClick={() => setSelectedLockerNumber(numStr)}
                  className={`p-2 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#D4FF00] text-black border-[#D4FF00] font-extrabold shadow-md scale-105'
                      : isUnavailable
                      ? 'bg-[#070D1E]/60 text-muted-foreground/40 border-border/40 cursor-not-allowed opacity-50 line-through'
                      : 'bg-[#070D1E] text-foreground border-border/80 hover:border-[#D4FF00]/50'
                  }`}
                >
                  #{numStr}
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-[#111C38]/60 border border-blue-500/30 rounded-lg flex items-center justify-between font-bold text-foreground">
            <span>Assigned Locker:</span>
            <span className="text-[#D4FF00]">#{selectedLockerNumber || 'None'}</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/80">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer font-mono">
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirmCheckIn}
              disabled={!selectedLockerNumber}
              className="bg-[#D4FF00] disabled:opacity-40 hover:bg-[#c3eb00] text-black font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-md transition-all flex items-center gap-1.5 font-mono"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Check-In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
