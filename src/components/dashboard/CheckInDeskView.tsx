'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Search, UserCheck, LogOut, Plus } from 'lucide-react';
import { GymMember } from '@/lib/types';
import { Toast } from '@/components/ui';
import { useDashboard } from '@/lib/orchestration';
import { filterMembers } from '@/lib/services';
import { getOccupiedLockers, getNextAvailableLocker } from '@/features/lockers';
import { CapacityWaitlistWidget, CheckInLogsTable } from './checkin-desk';

// Only mounted once a check-in is confirmed, so it's split out of the always-loaded
// CheckInDeskView bundle.
const LockerAssignmentModal = dynamic(() =>
  import('./checkin-desk/LockerAssignmentModal').then((m) => m.LockerAssignmentModal)
);

interface CheckInDeskViewProps {
  members?: GymMember[];
  onNavigateToRegistration?: () => void;
  totalLockers?: number;
}

export default function CheckInDeskView({
  members: propMembers,
  onNavigateToRegistration,
  totalLockers: propTotalLockers,
}: CheckInDeskViewProps) {
  const dashboard = useDashboard();
  const members = propMembers ?? dashboard.members;
  const totalLockers = propTotalLockers ?? dashboard.totalLockers;

  const t = useTranslations('CheckIn');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [isLockerModalOpen, setIsLockerModalOpen] = useState(false);
  const [selectedLockerNumber, setSelectedLockerNumber] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const occupiedLockers = useMemo(() => getOccupiedLockers(members), [members]);
  const filteredMembers = useMemo(() => filterMembers(members, searchQuery, 'all'), [
    members,
    searchQuery,
  ]);

  const activeMember = useMemo(() => {
    return (
      members.find((m) => m.id === selectedMemberId) ||
      filteredMembers[0] ||
      members[0] ||
      null
    );
  }, [members, selectedMemberId, filteredMembers]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCheckInMember = (member: GymMember) => {
    const nextLocker = getNextAvailableLocker(totalLockers, occupiedLockers, dashboard.lockerStatuses);
    setSelectedLockerNumber(nextLocker);
    setSelectedMemberId(member.id);
    setIsLockerModalOpen(true);
  };

  const confirmCheckIn = () => {
    if (!activeMember) return;

    dashboard.checkInMember(activeMember.id, selectedLockerNumber);

    setIsLockerModalOpen(false);
    showToast(`Checked in ${activeMember.firstName} with Locker #${selectedLockerNumber}.`);
  };

  const handleCheckOutMember = (member: GymMember) => {
    const assignedLockerNum = member.assignedLocker;

    dashboard.checkOutMember(member.id);

    showToast(`Checked out ${member.firstName}. Locker #${assignedLockerNum || 'N/A'} returned.`);
  };

  const checkedInCount = members.filter((m) => m.occupancyStatus === 'Checked In').length;

  return (
    <div id="checkin-desk-view-root" className="w-full space-y-4 font-sans">
      <Toast message={toastMessage} type="success" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t('title') || 'Check-In Desk & Key Assignment'}
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Scan member passes, verify active plans, assign digital lockers, and monitor live facility capacity.
          </p>
        </div>

        {onNavigateToRegistration && (
          <button
            type="button"
            onClick={onNavigateToRegistration}
            className="bg-[#D4FF00] hover:bg-[#c3eb00] text-black font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-md transition-all flex items-center gap-1.5 font-mono self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Registration</span>
          </button>
        )}
      </div>

      {/* Real-time Gym Capacity & Waitlist Widgets */}
      <CapacityWaitlistWidget
        currentCheckedInCount={checkedInCount}
        totalCapacity={50}
        waitlistQueue={[]}
      />

      {/* Main Scan & Active Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Member Search Desk */}
        <div className="bg-[#0B132B]/80 border border-border/80 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono border-b border-border/80 pb-2">
            Member Search &amp; Scan Desk
          </h3>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Scan barcode or type member name / ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs font-mono text-foreground placeholder:text-muted-foreground/60 rounded-lg pl-8 pr-3 py-1.5 outline-none"
            />
          </div>

          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
            {filteredMembers.map((m) => {
              const isSelected = activeMember?.id === m.id;
              const isCheckedIn = m.occupancyStatus === 'Checked In';

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMemberId(m.id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#111C38] border-[#D4FF00]/60'
                      : 'bg-[#070D1E] border-border/60 hover:border-border'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground font-sans">
                      {m.isOrganization && m.orgName ? m.orgName : `${m.firstName} ${m.lastName}`}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        isCheckedIn
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-muted/20 text-muted-foreground'
                      }`}
                    >
                      {m.occupancyStatus}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    Plan: {m.planTitle} | Exp: {m.expirationDate || 'N/A'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Member Active Console */}
        <div className="lg:col-span-2 bg-[#0B132B]/80 border border-border/80 rounded-xl p-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono border-b border-border/80 pb-2">
            Active Member Check-In Console
          </h3>

          {activeMember ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 bg-[#070D1E] border border-border/80 rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-base font-bold text-foreground font-sans">
                      {activeMember.isOrganization && activeMember.orgName
                        ? activeMember.orgName
                        : `${activeMember.firstName} ${activeMember.lastName}`}
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      ID: {activeMember.pinCode || activeMember.id} | Phone: {activeMember.phoneNumber || 'N/A'}
                    </p>
                  </div>
                  <span
                    className={`font-bold px-2.5 py-1 rounded text-xs ${
                      activeMember.occupancyStatus === 'Checked In'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {activeMember.occupancyStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-border/60 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase">Plan Enrolled</span>
                    <strong className="text-foreground">{activeMember.planTitle}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase">Expiration Date</span>
                    <strong className="text-amber-400">{activeMember.expirationDate || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase">Assigned Locker</span>
                    <strong className="text-[#D4FF00]">
                      {activeMember.assignedLocker ? `#${activeMember.assignedLocker}` : 'None'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {activeMember.occupancyStatus === 'Checked In' ? (
                  <button
                    type="button"
                    onClick={() => handleCheckOutMember(activeMember)}
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 px-5 py-2.5 rounded-lg font-bold text-xs cursor-pointer transition-all flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Check Out Member &amp; Free Locker</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCheckInMember(activeMember)}
                    className="bg-[#D4FF00] hover:bg-[#c3eb00] text-black font-extrabold px-5 py-2.5 rounded-lg text-xs cursor-pointer transition-all shadow-md flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Assign Locker &amp; Check In Member</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground font-mono text-xs">
              No member profile selected. Select a profile from the search desk.
            </div>
          )}
        </div>
      </div>

      {/* Check-in Logs Audit Table */}
      <div className="bg-[#0B132B]/80 border border-border/80 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono border-b border-border/80 pb-2">
          Today&apos;s Check-In &amp; Key Return Logs
        </h3>

        <CheckInLogsTable logs={dashboard.lockerLogs} />
      </div>

      {/* Locker Assignment Modal — only mounted once opened, so the dynamic-imported
          chunk is fetched on demand instead of alongside the rest of this view. */}
      {isLockerModalOpen && (
        <LockerAssignmentModal
          isOpen={isLockerModalOpen}
          onClose={() => setIsLockerModalOpen(false)}
          activeMember={activeMember}
          totalLockers={totalLockers}
          occupiedLockers={occupiedLockers}
          lockerStatuses={dashboard.lockerStatuses}
          selectedLockerNumber={selectedLockerNumber}
          setSelectedLockerNumber={setSelectedLockerNumber}
          onConfirmCheckIn={confirmCheckIn}
        />
      )}
    </div>
  );
}
