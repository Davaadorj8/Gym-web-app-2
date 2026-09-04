'use client';

import React, { useState, useMemo } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { GymMember, BuiltPlan } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface MemberCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: GymMember | null;
  plans: BuiltPlan[];
  onConfirmCancellation: (
    memberId: string,
    refundType: 'FULL' | 'PRORATED' | 'CREDIT' | 'MANUAL',
    amount: number,
    notes: string
  ) => void;
}

export function MemberCancellationModal({
  isOpen,
  onClose,
  member,
  plans,
  onConfirmCancellation,
}: MemberCancellationModalProps) {
  const [refundType, setRefundType] = useState<'FULL' | 'PRORATED' | 'CREDIT' | 'MANUAL'>('PRORATED');
  const [manualAmount, setManualAmount] = useState<number>(0);
  const [refundNotes, setRefundNotes] = useState<string>('');

  const calculatedRefundAmount = useMemo(() => {
    if (!member) return 0;
    const matchedPlan = plans.find((p) => p.title.toLowerCase() === member.planTitle.toLowerCase());
    const totalAmount = matchedPlan?.price || 150000;

    if (refundType === 'FULL') return totalAmount;
    if (refundType === 'CREDIT') return 0;
    if (refundType === 'MANUAL') return manualAmount;

    try {
      const start = new Date(member.startDate);
      const exp = new Date(member.expirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const totalTime = exp.getTime() - start.getTime();
      const remainingTime = exp.getTime() - today.getTime();

      if (totalTime <= 0) return 0;
      const ratio = Math.max(0, Math.min(1, remainingTime / totalTime));
      return Math.round(totalAmount * ratio);
    } catch {
      return Math.round(totalAmount / 2);
    }
  }, [member, refundType, manualAmount, plans]);

  if (!isOpen || !member) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmCancellation(member.id, refundType, calculatedRefundAmount, refundNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-[#0B132B] border border-border rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Cancel Membership &amp; Process Refund</h3>
              <p className="text-[10px] text-muted-foreground font-mono">
                {member.isOrganization ? member.orgName : `${member.firstName} ${member.lastName}`}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 font-mono text-xs">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Refund Calculation Model
            </label>
            <select
              value={refundType}
              onChange={(e) => setRefundType(e.target.value as 'FULL' | 'PRORATED' | 'CREDIT' | 'MANUAL')}
              className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-2.5 py-2 outline-none font-mono"
            >
              <option value="PRORATED">Prorated (Days Remaining)</option>
              <option value="FULL">100% Full Refund</option>
              <option value="CREDIT">Store Credit Only (No Cash Output)</option>
              <option value="MANUAL">Manual Amount Override</option>
            </select>
          </div>

          {refundType === 'MANUAL' && (
            <div className="space-y-1">
              <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Manual Override Amount (₮)
              </label>
              <input
                type="number"
                min="0"
                value={manualAmount}
                onChange={(e) => setManualAmount(Number(e.target.value))}
                className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-3 py-2 outline-none font-mono"
              />
            </div>
          )}

          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Refund Amount:</span>
              <span className="text-rose-400 font-bold text-sm">{formatCurrency(calculatedRefundAmount)}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Refund Reason / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Relocation, Medical issue..."
              value={refundNotes}
              onChange={(e) => setRefundNotes(e.target.value)}
              className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-3 py-2 outline-none font-sans"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/80">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-md transition-all font-mono"
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
