'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { useDashboard } from '@/lib/orchestration';

export default function StaffClockInOutWidget() {
  const { staffList, attendances, clockIn, clockOut, currentUser } = useDashboard();
  const [selectedStaffId, setSelectedStaffId] = React.useState<string>('');

  const effectiveStaffId = selectedStaffId || (
    currentUser && currentUser.role === 'staff'
      ? staffList.find((s) => s.id === currentUser.id)?.id
      : staffList[0]?.id
  ) || '';
  const [selectedShiftId, setSelectedShiftId] = React.useState('shift-morning');
  const [showForm, setShowForm] = React.useState(false);

  const activeAttendance = attendances.find((a) => a.status === 'ON_DUTY');

  const shifts = [
    { id: 'shift-morning', name: 'Morning (06:00 - 14:00)' },
    { id: 'shift-afternoon', name: 'Afternoon (14:00 - 22:00)' },
    { id: 'shift-night', name: 'Night (22:00 - 06:00)' },
  ];

  if (activeAttendance) {
    const shiftName = shifts.find(s => s.id === activeAttendance.shiftId)?.name || 'Custom Shift';
    return (
      <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 px-3.5 py-2 rounded-xl text-sm" id="staff-clock-in-out-widget">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
        <div className="text-foreground font-medium">
          <span className="font-bold text-green-700 dark:text-green-400">{activeAttendance.staffName}</span> is{' '}
          <span className="text-green-600 dark:text-green-500 font-bold">ON DUTY</span> ({shiftName})
        </div>
        <button
          type="button"
          onClick={() => clockOut(activeAttendance.id)}
          className="ml-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
        >
          Clock Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 bg-muted/50 border border-border px-3.5 py-2 rounded-xl text-sm w-full md:w-auto" id="staff-clock-in-out-widget">
      <div className="flex items-center gap-2 text-muted-foreground mr-1">
        <Clock className="w-4 h-4 text-muted-foreground animate-spin-slow" />
        <span className="font-semibold text-xs sm:text-sm">No Active Shift Staffed</span>
      </div>

      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold hover:opacity-90 rounded-lg text-xs transition-opacity cursor-pointer"
        >
          Open Clock-In Console
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={effectiveStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="px-2.5 py-1 bg-background border border-border text-foreground rounded-lg text-xs max-w-[150px]"
          >
            <option value="" disabled>Select Staff</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>
          <select
            value={selectedShiftId}
            onChange={(e) => setSelectedShiftId(e.target.value)}
            className="px-2.5 py-1 bg-background border border-border text-foreground rounded-lg text-xs"
          >
            {shifts.map((sh) => (
              <option key={sh.id} value={sh.id}>
                {sh.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (effectiveStaffId && selectedShiftId) {
                  clockIn(effectiveStaffId, selectedShiftId);
                  setShowForm(false);
                }
              }}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-xs cursor-pointer"
            >
              Clock In
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-2.5 py-1 bg-muted border border-border text-muted-foreground hover:text-foreground rounded-lg text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
