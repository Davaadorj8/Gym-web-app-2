'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Minus, X } from 'lucide-react';
import { GymMember, BuiltPlan } from '@/lib/types';
import { computeNewExpirationDate, calculateExtensionFee } from '@/lib/services';
import { formatCurrency } from '@/lib/utils';

interface MemberExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: GymMember | null;
  plans: BuiltPlan[];
  onConfirmExtension: (member: GymMember, months: number, fee: number, newExp: string) => void;
}

export function MemberExtensionModal({
  isOpen,
  onClose,
  member,
  plans,
  onConfirmExtension,
}: MemberExtensionModalProps) {
  const [extensionMonths, setExtensionMonths] = useState<number>(1);

  if (!isOpen || !member) return null;

  const newExpDateStr = computeNewExpirationDate(member.expirationDate, extensionMonths);
  const matchedPlan = plans.find((p) => p.title.toLowerCase() === member.planTitle.toLowerCase());
  const calculatedFee = calculateExtensionFee(matchedPlan, extensionMonths);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmExtension(member, extensionMonths, calculatedFee, newExpDateStr);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-[#0B132B] border border-border rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D4FF00]" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Extend Membership Duration</h3>
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
          <div className="p-3 bg-[#070D1E] border border-border/60 rounded-lg space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Current Plan:</span>
              <span className="text-foreground font-bold">{member.planTitle}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Current Expiration:</span>
              <span className="text-amber-400 font-bold">{member.expirationDate || 'N/A'}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Extension Months
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setExtensionMonths((m) => Math.max(1, m - 1))}
                className="w-8 h-8 bg-[#070D1E] border border-border/80 rounded-lg flex items-center justify-center text-foreground hover:border-[#D4FF00] cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-base font-bold text-[#D4FF00] w-8 text-center">{extensionMonths}</span>
              <button
                type="button"
                onClick={() => setExtensionMonths((m) => m + 1)}
                className="w-8 h-8 bg-[#070D1E] border border-border/80 rounded-lg flex items-center justify-center text-foreground hover:border-[#D4FF00] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#111C38]/60 border border-blue-500/30 rounded-lg space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>New Expiration Date:</span>
              <span className="text-emerald-400 font-bold">{newExpDateStr}</span>
            </div>
            <div className="flex justify-between font-bold text-foreground pt-1 border-t border-border/40">
              <span>Extension Fee:</span>
              <span className="text-[#D4FF00]">{formatCurrency(calculatedFee)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/80">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer font-mono">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#D4FF00] hover:bg-[#c3eb00] text-black font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-md transition-all font-mono"
            >
              Confirm Extension
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
