'use client';

import React from 'react';

interface LockerFloorGridProps {
  lockerList: {
    name: string;
    shortName: string;
    occupant?: { id: string; name: string } | null;
    status: string;
  }[];
  selectedLockerNumber: string | null;
  onSelectLocker: (lockerName: string) => void;
}

export function LockerFloorGrid({
  lockerList,
  selectedLockerNumber,
  onSelectLocker,
}: LockerFloorGridProps) {
  return (
    <div className="bg-[#0B132B]/80 border border-border/80 rounded-xl p-4 space-y-3 font-sans">
      <div className="flex items-center justify-between border-b border-border/80 pb-2.5 font-mono">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Locker Floor Layout &amp; Occupancy Grid
        </h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-sky-500 inline-block" /> Occupied
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> Service/Out
          </span>
        </div>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-12 gap-1.5 max-h-[280px] overflow-y-auto pr-1">
        {lockerList.map((locker) => {
          const isSelected = selectedLockerNumber === locker.name;
          const isOccupied = locker.status === 'occupied';
          const isService = locker.status !== 'available' && !isOccupied;

          return (
            <button
              key={locker.name}
              type="button"
              onClick={() => onSelectLocker(locker.name)}
              className={`p-2 rounded-lg text-xs font-mono font-bold border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#D4FF00] text-black border-[#D4FF00] font-extrabold shadow-md scale-105'
                  : isOccupied
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 hover:bg-sky-500/30'
                  : isService
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-[#070D1E] text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
              }`}
              title={`${locker.name} - ${locker.occupant ? locker.occupant.name : locker.status}`}
            >
              {locker.shortName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
