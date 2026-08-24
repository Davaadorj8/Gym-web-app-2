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
    const firstFreeLocker = getNextAvailableLocker(totalLockers, occupiedLockers);
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
      dashboard.checkInMember(activeMember.id, selectedLockerNumber);
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

  return (
    <div id="checkin-desk-root" className="space-y-6 pb-12">
      {/* Toast Notification */}
      <Toast id="checkin-toast" message={toastMessage} type="success" />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: LOOKUP ATHLETE ================= */}
        <div id="left-lookup-column" className="lg:col-span-6 xl:col-span-6 space-y-4">
          {/* Section Title */}
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold tracking-wider text-muted-foreground uppercase font-mono">
              {t('lookupAthleteTitle')}
            </h2>
            <Badge variant="info">{filteredMembers.length} Athletes</Badge>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Input
              id="input-athlete-search"
              icon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
            />
            {searchQuery && (
              <Button
                id="btn-clear-search"
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1 h-8 text-[11px]"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Search Results List */}
          <div id="search-results-list" className="space-y-3">
            {members.length === 0 ? (
              <Card className="text-center py-12 p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-muted border border-border mx-auto flex items-center justify-center text-muted-foreground">
                  <User className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">No registered athletes yet</h4>
                  <p className="text-xs text-muted-foreground mt-1">
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
              <Card className="text-center py-10 p-6 space-y-2">
                <p className="text-xs text-muted-foreground font-mono">
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
                  <Card
                    key={member.id}
                    id={`athlete-card-${member.id}`}
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary ring-1 ring-primary shadow-md'
                        : 'hover:border-border/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 p-4">
                      {/* Left: Avatar & Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-muted border border-border shrink-0 overflow-hidden flex items-center justify-center">
                          {member.photoUrl || member.profileImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={member.photoUrl || member.profileImage}
                              alt={`${member.firstName} ${member.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-muted-foreground stroke-[1.5]" />
                          )}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-foreground text-sm tracking-wide">
                              {member.firstName} {member.lastName}
                            </span>
                            <Badge variant="primary">{member.id}</Badge>
                          </div>

                          <div className="text-xs text-muted-foreground font-mono truncate">
                            {member.planTitle || 'Standard Plan'}
                          </div>

                          <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-2">
                            <span>Expires: {member.expirationDate}</span>
                            {member.phone && <span>• {member.phone}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Pill & Action Button */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {isCheckedIn ? (
                          <Badge variant="success">{member.assignedLocker || 'In Gym'}</Badge>
                        ) : isExpired ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : isSuspended ? (
                          <Badge variant="warning">Suspended</Badge>
                        ) : (
                          <Badge variant="outline">Offsite</Badge>
                        )}

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
                              className="h-8 text-xs"
                            >
                              <LogOut className="w-3.5 h-3.5 mr-1" />
                              <span>{t('checkOutBtn')}</span>
                            </Button>
                          ) : (
                            <Button
                              id={`btn-checkin-${member.id}`}
                              variant="primary"
                              size="sm"
                              disabled={isExpired}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCheckInMember(member);
                              }}
                              className="h-8 text-xs"
                            >
                              <UserCheck className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                              <span>{t('checkInBtn')}</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: ACTIVE ATHLETE PROFILE ================= */}
        <div id="right-athlete-profile" className="lg:col-span-6 xl:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold tracking-wider text-muted-foreground uppercase font-mono">
              {t('activeAthleteTitle')}
            </h2>
            {activeMember && <Badge variant="primary">{activeMember.id}</Badge>}
          </div>

          {activeMember ? (
            <Card id="active-athlete-profile-card" className="p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="relative w-24 h-24 rounded-3xl bg-muted border-2 border-border overflow-hidden shrink-0 flex items-center justify-center shadow-lg">
                  {activeMember.photoUrl || activeMember.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeMember.photoUrl || activeMember.profileImage}
                      alt={`${activeMember.firstName} ${activeMember.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground stroke-[1.2]" />
                  )}
                  <div className="absolute bottom-1 right-1 p-1 rounded-full bg-background/80 text-muted-foreground">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>

                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-foreground uppercase tracking-wide">
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

                  <p className="text-xs font-mono text-primary font-bold">
                    {activeMember.planTitle || 'All Access Gym Membership'}
                  </p>

                  <p className="text-xs text-muted-foreground font-mono">
                    {activeMember.email} • {activeMember.phone || 'No phone'}
                  </p>
                </div>
              </div>

              {/* Status Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-muted/40 border border-border p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground block">
                    {t('colExpiration')}
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground mt-0.5 block">
                    {activeMember.expirationDate}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground block">
                    {t('colOccupancy')}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold mt-0.5 block ${
                      activeMember.occupancyStatus === 'Checked In'
                        ? 'text-emerald-400'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {activeMember.occupancyStatus || 'Checked Out'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground block">
                    {t('colLocker')}
                  </span>
                  <span className="text-xs font-mono font-bold text-primary mt-0.5 block">
                    {activeMember.assignedLocker || 'None'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                {activeMember.occupancyStatus === 'Checked In' ? (
                  <Button
                    id="btn-profile-checkout"
                    variant="destructive"
                    size="lg"
                    onClick={() => handleCheckOutMember(activeMember)}
                    className="flex-1"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>{t('checkOutBtn')}</span>
                  </Button>
                ) : (
                  <Button
                    id="btn-profile-checkin"
                    variant="primary"
                    size="lg"
                    disabled={activeMember.status === 'Expired'}
                    onClick={() => handleCheckInMember(activeMember)}
                    className="flex-1"
                  >
                    <UserCheck className="w-4 h-4 mr-2 stroke-[2.5]" />
                    <span>{t('checkInBtn')}</span>
                  </Button>
                )}
              </div>
            </Card>
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
              const isSelected = selectedLockerNumber === loc;

              return (
                <button
                  key={loc}
                  type="button"
                  disabled={isOccupied}
                  onClick={() => setSelectedLockerNumber(loc)}
                  className={`p-2.5 rounded-xl border text-center font-mono text-xs transition-all cursor-pointer ${
                    isOccupied
                      ? 'bg-destructive/10 border-destructive/20 text-destructive/50 cursor-not-allowed opacity-60'
                      : isSelected
                      ? 'bg-primary text-primary-foreground border-primary font-bold shadow-md'
                      : 'bg-muted border-border text-foreground hover:border-primary/50'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 mx-auto mb-1 opacity-70" />
                  <span className="block text-[11px]">{loc.replace('Locker #', '#')}</span>
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
