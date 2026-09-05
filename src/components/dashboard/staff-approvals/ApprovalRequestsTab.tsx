'use client';

import React from 'react';
import { Check, X, Shield, Clock } from 'lucide-react';
import { StaffAccount } from '@/features/staff';

interface ApprovalRequestsTabProps {
  staffList: StaffAccount[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ApprovalRequestsTab({
  staffList,
  onApprove,
  onReject,
}: ApprovalRequestsTabProps) {
  const pendingStaff = staffList.filter((s) => s.status === 'Pending');

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-border/80">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
            Pending Staff Approval Queue
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded font-bold">
          {pendingStaff.length} Pending
        </span>
      </div>

      {pendingStaff.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground font-mono text-xs">
          <Shield className="w-8 h-8 text-muted-foreground/40 mx-auto mb-1.5" />
          <p>No pending staff registration requests in queue.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
          {pendingStaff.map((staff) => (
            <div
              key={staff.id}
              className="p-3 bg-[#070D1E] border border-border/80 rounded-xl flex items-center justify-between gap-3 font-mono text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground font-sans">{staff.fullName}</span>
                  <span className="text-[10px] text-muted-foreground">(@{staff.username})</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Role: <span className="text-slate-300">{staff.role}</span> | Shift: <span className="text-slate-300">{staff.assignedShift}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onApprove(staff.id)}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
                <button
                  type="button"
                  onClick={() => onReject(staff.id)}
                  className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
