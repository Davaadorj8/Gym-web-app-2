'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Users } from 'lucide-react';
import { GymMember, MembershipExtensionLog } from '@/lib/types';
import { Toast } from '@/components/ui';
import { useDashboard } from '@/lib/orchestration';
import { filterMembers, MemberFilterTab } from '@/lib/services';
import { cn } from '@/lib/utils';
import {
  MemberDirectoryTable,
  MemberExtensionModal,
  MemberCancellationModal,
} from './member-directory';

interface MemberDirectoryViewProps {
  members?: GymMember[];
  onUpdateMember?: (updated: GymMember) => void;
  onDeleteMember?: (memberId: string) => void;
  onNavigateToRegistration?: () => void;
  onNavigateToCheckIn?: () => void;
}

export default function MemberDirectoryView({
  members: propMembers,
  onUpdateMember: propOnUpdateMember,
  onDeleteMember: propOnDeleteMember,
  onNavigateToRegistration,
}: MemberDirectoryViewProps) {
  const dashboard = useDashboard();
  const members = propMembers ?? dashboard.members;
  const plans = dashboard.plans;

  const t = useTranslations('Directory');

  const [activeFilter, setActiveFilter] = useState<MemberFilterTab>(
    (dashboard.directoryFilter as MemberFilterTab) || 'all'
  );

  const [editingMember, setEditingMember] = useState<GymMember | null>(null);
  const [cancellingMember, setCancellingMember] = useState<GymMember | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const filteredList = filterMembers(members, activeFilter);

  const handleConfirmExtension = async (
    member: GymMember,
    months: number,
    fee: number,
    newExp: string
  ) => {
    const newLog: MembershipExtensionLog = {
      id: `ext-${Date.now()}`,
      extendedAt: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString(),
      monthsAdded: months,
      feePaid: fee,
      previousExpirationDate: member.expirationDate,
      newExpirationDate: newExp,
    };

    const updated: GymMember = {
      ...member,
      expirationDate: newExp,
      extensionHistory: [
        ...(member.extensionHistory || []),
        newLog,
      ],
    };

    if (propOnUpdateMember) propOnUpdateMember(updated);
    else await dashboard.extendMember(member.id, months, fee, 'Cash', newExp);

    showToast(`Extended ${member.isOrganization ? member.orgName : member.firstName} by ${months} month(s).`);
  };

  const handleConfirmCancellation = async (
    memberId: string,
    refundType: 'FULL' | 'PRORATED' | 'CREDIT' | 'MANUAL',
    amount: number,
    notes: string
  ) => {
    await dashboard.cancelAndRefundMember(
      memberId,
      refundType,
      refundType === 'MANUAL' ? amount : undefined,
      notes
    );
    showToast(`Cancelled membership & processed ${refundType} refund.`);
  };

  const handleDeleteMember = (member: GymMember) => {
    if (propOnDeleteMember) propOnDeleteMember(member.id);
    else dashboard.deleteMember(member.id);
    showToast(`Deleted member profile.`);
  };

  return (
    <div id="member-directory-view-root" className="w-full space-y-4 font-sans">
      <Toast message={toastMessage} type="success" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t('title') || 'Member Directory'}
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Search member profiles, inspect plan status, process duration extensions, and cancel memberships.
          </p>
        </div>

        {onNavigateToRegistration && (
          <button
            type="button"
            onClick={onNavigateToRegistration}
            className="bg-[#D4FF00] hover:bg-[#c3eb00] text-black font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-md transition-all flex items-center gap-1.5 font-mono self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Member Registration</span>
          </button>
        )}
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-3 border-b border-border/80 text-xs font-mono font-bold overflow-x-auto select-none pt-0.5">
        {[
          { id: 'all', label: 'ALL MEMBERS' },
          { id: 'active', label: 'CHECKED IN' },
          { id: 'expired', label: 'EXPIRED' },
          { id: 'under18', label: 'UNDER 18' },
          { id: 'over18', label: 'OVER 18' },
          { id: 'organization', label: 'ORGANIZATIONS' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id as MemberFilterTab)}
            className={cn(
              'pb-2 px-0.5 border-b-2 transition-all cursor-pointer whitespace-nowrap',
              activeFilter === tab.id
                ? 'text-[#D4FF00] border-[#D4FF00]'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Member Table Card */}
      <div className="bg-[#0B132B]/80 border border-border/80 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border/80 pb-2.5 font-mono">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#D4FF00]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Directory Profiles
            </h3>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {filteredList.length} profiles displayed
          </span>
        </div>

        <MemberDirectoryTable
          members={filteredList}
          onExtend={(m) => setEditingMember(m)}
          onCancel={(m) => setCancellingMember(m)}
          onDelete={handleDeleteMember}
        />
      </div>

      {/* Extension Modal */}
      <MemberExtensionModal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        member={editingMember}
        plans={plans}
        onConfirmExtension={handleConfirmExtension}
      />

      {/* Cancellation Modal */}
      <MemberCancellationModal
        isOpen={!!cancellingMember}
        onClose={() => setCancellingMember(null)}
        member={cancellingMember}
        plans={plans}
        onConfirmCancellation={handleConfirmCancellation}
      />
    </div>
  );
}
