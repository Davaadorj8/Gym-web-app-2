'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Search,
  UserCheck,
  LogOut,
  Camera,
  KeyRound,
  User,
  UserPlus,
} from 'lucide-react';
import { GymMember } from '@/lib/types';
import { Button, Badge, Card, Input, Modal, Toast } from '@/components/ui';
import { useDashboard } from '@/lib/orchestration';
import {
  filterMembers,
  generateLockerList,
  getNextAvailableLocker,
  getOccupiedLockers,
  isLockerUnavailableStatus,
} from '@/lib/services';

interface CheckInDeskViewProps {
  members?: GymMember[];
  onUpdateMember?: (updatedMember: GymMember) => void;
  onNavigateToRegistration?: () => void;
  totalLockers?: number;
  onLogLockerEvent?: (event: {
    lockerNumber: string;
    memberId: string;
    memberName: string;
    eventType: 'Checked In' | 'Checked Out';
    eventDescription: string;
    statusLabel: 'Check-In Logged' | 'Key Returned';
  }) => void;
}

export default function CheckInDeskView({
  members: propMembers,
  onUpdateMember: propOnUpdateMember,
  onNavigateToRegistration,
  totalLockers: propTotalLockers,
  onLogLockerEvent: propOnLogLockerEvent,
}: CheckInDeskViewProps) {
  const dashboard = useDashboard();
  const members = propMembers ?? dashboard.members;
  const totalLockers = propTotalLockers ?? dashboard.totalLockers;

  const t = useTranslations('CheckIn');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');

  // Locker selection modal for check-in
  const [isLockerModalOpen, setIsLockerModalOpen] = useState(false);
  const [selectedLockerNumber, setSelectedLockerNumber] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calculate occupied lockers using domain service
  const occupiedLockers = useMemo(() => {
    return getOccupiedLockers(members);
  }, [members]);

  // Generate locker list using domain service
  const availableLockersList = useMemo(() => {
    return generateLockerList(totalLockers);
  }, [totalLockers]);

  // Filtered members by search query using domain service
  const filteredMembers = useMemo(() => {
    return filterMembers(members, searchQuery, 'all');
  }, [members, searchQuery]);

  // Current selected active member
  const activeMember = useMemo(() => {
    return (
      members.find((m) => m.id === selectedMemberId) ||
      filteredMembers[0] ||
      members[0] ||
      null
    );
  }, [members, selectedMemberId, filteredMembers]);

  // Show temporary toast notification
  const triggerToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handle Check-in action
  const handleCheckInMember = (member: GymMember) => {
    const firstFreeLocker = getNextAvailableLocker(totalLockers, occupiedLockers, dashboard.lockerStatuses);
    setSelectedLockerNumber(firstFreeLocker);
    setSelectedMemberId(member.id);
    setIsLockerModalOpen(true);
  };

  const confirmCheckIn = () => {
    if (!activeMember) return;

    if (propOnUpdateMember) {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const updated: GymMember = {
        ...activeMember,
        occupancyStatus: 'Checked In',
        assignedLocker: selectedLockerNumber,
        lastCheckInTime: `${new Date().toISOString().split('T')[0]} ${nowStr}`,
      };
      propOnUpdateMember(updated);

      if (propOnLogLockerEvent) {
        propOnLogLockerEvent({
          lockerNumber: selectedLockerNumber,
          memberId: activeMember.id,
          memberName: `${activeMember.firstName} ${activeMember.lastName}`.trim(),
          eventType: 'Checked In',
          eventDescription: `Checked In (${selectedLockerNumber})`,
          statusLabel: 'Check-In Logged',
        });
      }
    } else {
      const activeStaff = dashboard.attendances.find((a) => a.status === 'ON_DUTY');
      dashboard.checkInMember(activeMember.id, selectedLockerNumber, activeStaff?.staffId);
    }

    setIsLockerModalOpen(false);
    triggerToast(
      t('checkInSuccess', {
        name: `${activeMember.firstName} ${activeMember.lastName}`,
        locker: selectedLockerNumber,
      })
    );
  };

  // Handle Check-out action
  const handleCheckOutMember = (member: GymMember) => {
    if (propOnUpdateMember) {
      const updated: GymMember = {
        ...member,
        occupancyStatus: 'Checked Out',
        assignedLocker: null,
      };
      propOnUpdateMember(updated);

      if (propOnLogLockerEvent && member.assignedLocker) {
        propOnLogLockerEvent({
          lockerNumber: member.assignedLocker,
          memberId: member.id,
          memberName: `${member.firstName} ${member.lastName}`.trim(),
          eventType: 'Checked Out',
          eventDescription: `Checked Out (${member.assignedLocker})`,
          statusLabel: 'Key Returned',
        });
      }
    } else {
      dashboard.checkOutMember(member.id);
    }

    triggerToast(t('checkOutSuccess', { name: `${member.firstName} ${member.lastName}` }));
  };

  const currentlyCheckedInCount = useMemo(() => {
    return members.filter((m) => m.occupancyStatus === 'Checked In').length;
  }, [members]);

  return (
    <div id="checkin-desk-root" className="space-y-6 pb-12">
      {/* Toast Notification */}
      <Toast id="checkin-toast" message={toastMessage} type="success" />

      {/* Gym Capacity Meter & Active Waitlist - Fluid Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[clamp(0.75rem,1.2vw,1.25rem)] mb-6">
        {/* GYM CAPACITY MONITORING */}
        <div className="p-[clamp(1rem,1.4vw,1.5rem)] bg-slate-900/50 rounded-xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Gym Capacity Monitoring
            </span>
            <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
              {currentlyCheckedInCount} / {dashboard.maxGymCapacity} Members
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full my-3.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                currentlyCheckedInCount >= dashboard.maxGymCapacity
                  ? 'bg-red-500'
                  : currentlyCheckedInCount >= dashboard.maxGymCapacity * 0.8
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (currentlyCheckedInCount / dashboard.maxGymCapacity) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Remaining slots: {Math.max(0, dashboard.maxGymCapacity - currentlyCheckedInCount)}</span>
            <div className="flex items-center gap-1.5">
              <span>Limit:</span>
              <input
                type="number"
                min="1"
                value={dashboard.maxGymCapacity}
                onChange={(e) => dashboard.setMaxGymCapacity(Number(e.target.value) || 40)}
                className="w-14 px-1.5 py-0.5 border border-white/10 rounded-md bg-slate-800 text-slate-200 font-bold text-center text-xs"
              />
            </div>
          </div>
        </div>

        {/* LOCKER & GYM WAITLIST */}
        <div className="p-[clamp(1rem,1.4vw,1.5rem)] bg-slate-900/50 rounded-xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Locker & Gym Waitlist
            </span>
            <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-slate-800 text-slate-400 border border-white/10">
              {dashboard.waitlist.filter((w) => w.status === 'WAITING').length} Queued
            </span>
          </div>

          {dashboard.waitlist.length === 0 ? (
            <div className="py-4 flex items-center justify-center text-xs sm:text-sm italic text-slate-500">
              No active waitlisted members.
            </div>
          ) : (
            <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1 my-2">
              {dashboard.waitlist.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-xs bg-slate-800/60 border border-white/10 px-3 py-2 rounded-lg"
                >
                  <div>
                    <span className="font-bold text-white mr-1.5">{entry.memberName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                      {entry.resourceType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.status === 'OFFERED' && (
                      <span className="text-[10px] text-amber-400 font-bold font-mono animate-pulse mr-1">
                        OFFERED ({entry.offeredLockerNumber})
                      </span>
                    )}
                    {entry.status === 'WAITING' ? (
                      <button
                        type="button"
                        onClick={() => dashboard.leaveWaitlist(entry.id)}
                        className="text-red-400 hover:text-red-300 font-medium cursor-pointer"
                      >
                        Remove
                      </button>
                    ) : entry.status === 'OFFERED' ? (
                      <button
                        type="button"
                        onClick={() => {
                          dashboard.claimWaitlistOffer(entry.id);
                          dashboard.checkInMember(entry.memberId, entry.offeredLockerNumber || '');
                        }}
                        className="text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer font-mono"
                      >
                        Claim Offer
                      </button>
                    ) : (
                      <span className="text-slate-500 font-mono">Claimed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Split Panel Layout */}
      <div className="flex flex-col lg:flex-row gap-[clamp(1rem,1.5vw,1.5rem)] items-start w-full">
        {/* ================= LEFT COLUMN: LOOKUP ATHLETE ================= */}
        <div id="left-lookup-column" className="w-full lg:flex-[1_1_420px] flex flex-col gap-3">
          {/* Section Title */}
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase font-mono">
              {t('lookupAthleteTitle')}
            </h2>
            <Badge variant="info">{filteredMembers.length} Athletes</Badge>
          </div>

          {/* Dynamic Search Input Bar */}
          <div className="relative w-full">
            <input
              id="input-athlete-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredMembers.length === 1) {
                    const match = filteredMembers[0];
                    setSelectedMemberId(match.id);
                    if (match.occupancyStatus === 'Checked In') {
                      handleCheckOutMember(match);
                    } else {
                      handleCheckInMember(match);
                    }
                  } else if (filteredMembers.length > 1) {
                    const exactMatch = filteredMembers.find(
                      (m) => m.id.toLowerCase() === searchQuery.trim().toLowerCase()
                    );
                    if (exactMatch) {
                      setSelectedMemberId(exactMatch.id);
                      if (exactMatch.occupancyStatus === 'Checked In') {
                        handleCheckOutMember(exactMatch);
                      } else {
                        handleCheckInMember(exactMatch);
                      }
                    }
                  }
                }
              }}
              placeholder={t('searchPlaceholder')}
              className="w-full h-[clamp(2.5rem,3.8vh,2.85rem)] px-4 pl-10 text-xs sm:text-sm bg-slate-900/70 border border-white/10 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-yellow-400/40 transition-colors"
              autoFocus
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <Button
                id="btn-clear-search"
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 text-[11px] text-slate-400 hover:text-white"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Search Results List */}
          <div id="search-results-list" className="space-y-2.5">
            {members.length === 0 ? (
              <Card className="text-center py-12 p-6 space-y-3 bg-slate-900/40 border border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 mx-auto flex items-center justify-center text-slate-400">
                  <User className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">No registered athletes yet</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Please add athletes using the Registration section.
                  </p>
                </div>
                {onNavigateToRegistration && (
                  <Button
                    id="btn-empty-go-register"
                    size="sm"
                    onClick={onNavigateToRegistration}
                    className="mt-2"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                    <span>Register Athlete</span>
                  </Button>
                )}
              </Card>
            ) : filteredMembers.length === 0 ? (
              <Card className="text-center py-10 p-6 space-y-2 bg-slate-900/40 border border-white/10">
                <p className="text-xs text-slate-400 font-mono">
                  No athletes found matching your search.
                </p>
              </Card>
            ) : (
              filteredMembers.map((member) => {
                const isSelected = activeMember?.id === member.id;
                const isCheckedIn = member.occupancyStatus === 'Checked In';
                const isExpired = member.status === 'Expired';
                const isSuspended = member.status === 'Suspended';

                return (
                  <div
                    key={member.id}
                    id={`athlete-card-${member.id}`}
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'w-full p-3.5 bg-slate-900/80 rounded-xl border-l-[3px] border-l-yellow-400 border-y border-r border-white/10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shadow-lg shadow-black/20'
                        : 'w-full p-3.5 bg-slate-900/40 hover:bg-slate-900/60 rounded-xl border border-white/10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 transition-colors'
                    }`}
                  >
                    {/* Left: Avatar & Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-800 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                        {member.photoUrl || member.profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.photoUrl || member.profileImage}
                            alt={`${member.firstName} ${member.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-slate-400 stroke-[1.5]" />
                        )}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-white text-sm tracking-wide">
                            {member.firstName} {member.lastName}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-semibold">
                            {member.id}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400 font-mono truncate">
                          {member.planTitle || 'Standard Plan'}
                        </div>

                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                          <span>Expires: {member.expirationDate}</span>
                          {member.phone && <span>• {member.phone}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Pill & Action Button */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex gap-1">
                        {member.status === 'Pending' && (
                          <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wider text-[9px] px-1.5 py-0.5 rounded">
                            Payment Due
                          </span>
                        )}
                        {member.assignedLocker && (
                          <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold uppercase tracking-wider text-[9px] px-1.5 py-0.5 rounded">
                            Locker {member.assignedLocker}
                          </span>
                        )}
                        {isCheckedIn ? (
                          <Badge variant="success">Checked In</Badge>
                        ) : isExpired ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : isSuspended ? (
                          <Badge variant="warning">Suspended</Badge>
                        ) : (
                          <Badge variant="outline">Offsite</Badge>
                        )}
                      </div>

                      <div>
                        {isCheckedIn ? (
                          <Button
                            id={`btn-checkout-${member.id}`}
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckOutMember(member);
                            }}
                            className="h-7 text-xs font-mono font-bold px-2.5"
                          >
                            <LogOut className="w-3 h-3 mr-1" />
                            <span>{t('checkOutBtn')}</span>
                          </Button>
                        ) : (
                          <Button
                            id={`btn-checkin-${member.id}`}
                            variant={isExpired || isSuspended ? "destructive" : "primary"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckInMember(member);
                            }}
                            className="h-7 text-xs font-mono font-bold px-2.5"
                          >
                            <UserCheck className="w-3 h-3 mr-1 stroke-[2.5]" />
                            <span>{isExpired || isSuspended ? "Override" : t('checkInBtn')}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: ACTIVE ATHLETE PROFILE ================= */}
        <div id="right-athlete-profile" className="w-full lg:flex-[1.5_1_520px] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase font-mono">
              {t('activeAthleteTitle')}
            </h2>
            {activeMember && (
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
                {activeMember.id}
              </span>
            )}
          </div>

          {activeMember ? (
            <div className="space-y-4">
              <div id="active-athlete-profile-card" className="p-[clamp(1rem,1.8vw,1.75rem)] bg-slate-900/40 rounded-xl border border-white/10 space-y-6">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="relative w-24 h-24 rounded-2xl bg-slate-800 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center shadow-lg">
                    {activeMember.photoUrl || activeMember.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activeMember.photoUrl || activeMember.profileImage}
                        alt={`${activeMember.firstName} ${activeMember.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-slate-400 stroke-[1.2]" />
                    )}
                    <div className="absolute bottom-1 right-1 p-1 rounded-full bg-slate-900/80 text-slate-400">
                      <Camera className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                        {activeMember.firstName} {activeMember.lastName}
                      </h3>
                      <Badge
                        variant={
                          activeMember.status === 'Active'
                            ? 'success'
                            : activeMember.status === 'Expired'
                            ? 'destructive'
                            : 'warning'
                        }
                      >
                        {activeMember.status}
                      </Badge>
                    </div>

                    <p className="text-xs font-mono text-yellow-400 font-semibold">
                      {activeMember.planTitle || 'All Access Gym Membership'}
                    </p>

                    <p className="text-xs text-slate-400 font-mono">
                      {activeMember.email} • {activeMember.phone || 'No phone'}
                    </p>
                  </div>
                </div>

                {/* Status Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-900/60 border border-white/10 p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block">
                      {t('colExpiration')}
                    </span>
                    <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                      {activeMember.expirationDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block">
                      {t('colOccupancy')}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold mt-0.5 block ${
                        activeMember.occupancyStatus === 'Checked In'
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {activeMember.occupancyStatus || 'Checked Out'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block">
                      {t('colLocker')}
                    </span>
                    <span className="text-xs font-mono font-bold text-yellow-400 mt-0.5 block">
                      {activeMember.assignedLocker || 'None'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center gap-3">
                    {activeMember.occupancyStatus === 'Checked In' ? (
                      <Button
                        id="btn-profile-checkout"
                        variant="destructive"
                        size="lg"
                        onClick={() => handleCheckOutMember(activeMember)}
                        className="flex-1 font-mono font-bold"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        <span>{t('checkOutBtn')}</span>
                      </Button>
                    ) : (
                      <Button
                        id="btn-profile-checkin"
                        variant={activeMember.status === 'Expired' || activeMember.status === 'Suspended' ? 'destructive' : 'primary'}
                        size="lg"
                        onClick={() => handleCheckInMember(activeMember)}
                        className="flex-1 font-mono font-bold"
                      >
                        <UserCheck className="w-4 h-4 mr-2 stroke-[2.5]" />
                        <span>
                          {activeMember.status === 'Expired' || activeMember.status === 'Suspended'
                            ? 'Emergency Override'
                            : t('checkInBtn')}
                        </span>
                      </Button>
                    )}
                  </div>

                  {/* Waitlist Buttons */}
                  {activeMember.occupancyStatus !== 'Checked In' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          dashboard.joinWaitlist('LOCKER', activeMember.id, `${activeMember.firstName} ${activeMember.lastName}`.trim());
                          triggerToast(`Added ${activeMember.firstName} to Locker Waitlist`);
                        }}
                        className="text-xs"
                      >
                        Queue for Locker
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          dashboard.joinWaitlist('GYM_FLOOR', activeMember.id, `${activeMember.firstName} ${activeMember.lastName}`.trim());
                          triggerToast(`Added ${activeMember.firstName} to Gym Waitlist`);
                        }}
                        className="text-xs"
                      >
                        Queue for Gym Floor
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Lobby Check-In Activity Logs */}
              <div className="p-5 bg-slate-900/40 rounded-xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs sm:text-sm font-semibold tracking-wider text-slate-300 uppercase font-mono">
                    Recent Check-In Activity
                  </h3>
                  <Badge variant="outline">Live Logs</Badge>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {dashboard.lockerLogs.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-6">
                      No recent check-in activities logged.
                    </p>
                  ) : (
                    dashboard.lockerLogs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="text-xs border-b border-white/5 pb-2 last:border-b-0 last:pb-0 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{log.memberName}</span>
                          <span className="text-[10px] font-mono text-slate-400">{log.timeFormatted || 'Now'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>{log.eventDescription}</span>
                          <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-200 font-semibold border border-white/5">
                            Processed by: {log.staffLogged || 'System'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ================= MODAL: SELECT LOCKER FOR CHECK-IN ================= */}
      <Modal
        id="modal-select-locker"
        isOpen={isLockerModalOpen}
        onClose={() => setIsLockerModalOpen(false)}
        title={t('modalLockerTitle')}
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsLockerModalOpen(false)}>
              Cancel
            </Button>
            <Button
              id="btn-confirm-checkin-locker"
              variant="primary"
              size="sm"
              onClick={confirmCheckIn}
            >
              <UserCheck className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              <span>{t('confirmCheckInBtn')}</span>
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground font-mono">{t('modalLockerDesc')}</p>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-60 overflow-y-auto p-1">
            {availableLockersList.map((loc) => {
              const isOccupied = occupiedLockers.has(loc);
              const customStatus = dashboard.lockerStatuses[loc];
              const isOutOfService = customStatus && isLockerUnavailableStatus(customStatus);
              const isDisabled = isOccupied || isOutOfService;
              const isSelected = selectedLockerNumber === loc;

              let statusLabel = 'Available';
              if (isOccupied) statusLabel = 'Occupied';
              else if (customStatus === 'clean') statusLabel = 'Needs Clean';
              else if (customStatus === 'repair') statusLabel = 'Repair';
              else if (customStatus === 'key_lost') statusLabel = 'Key Lost';
              else if (customStatus === 'key_not_returned') statusLabel = 'Overdue';
              else if (customStatus === 'inactive') statusLabel = 'Inactive';

              return (
                <button
                  key={loc}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setSelectedLockerNumber(loc)}
                  title={`${loc}: ${statusLabel}`}
                  className={`p-2.5 rounded-xl border text-center font-mono text-xs transition-all cursor-pointer relative ${
                    isDisabled
                      ? 'bg-destructive/10 border-destructive/20 text-destructive/60 cursor-not-allowed opacity-60'
                      : isSelected
                      ? 'bg-primary text-primary-foreground border-primary font-bold shadow-md'
                      : 'bg-muted border-border text-foreground hover:border-primary/50'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 mx-auto mb-1 opacity-70" />
                  <span className="block text-[11px] font-bold">{loc.replace('Locker #', '#')}</span>
                  {customStatus && customStatus !== 'available' && !isOccupied && (
                    <span className="block text-[8px] uppercase tracking-tighter text-amber-400 font-extrabold truncate mt-0.5">
                      {statusLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between bg-muted/40 border border-border p-3 rounded-xl text-xs font-mono">
            <span className="text-muted-foreground">Selected:</span>
            <span className="font-bold text-primary">{selectedLockerNumber}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
