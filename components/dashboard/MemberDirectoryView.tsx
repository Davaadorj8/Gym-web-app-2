'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Search,
  Calendar,
  Trash2,
  Edit3,
  User,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { GymMember } from '@/lib/types';
import {
  Button,
  Badge,
  Card,
  Input,
  Modal,
  Toast,
  TabsList,
  type TabItem,
} from '@/components/ui';
import { useDashboard } from '@/lib/orchestration';
import {
  computeNewExpirationDate,
  calculateExtensionFee,
  filterMembers,
  type MemberFilterTab,
} from '@/lib/services';

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

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<MemberFilterTab>((dashboard.directoryFilter as MemberFilterTab) || 'all');

  // Modal States
  const [editingMember, setEditingMember] = useState<GymMember | null>(null);
  const [extensionMonths, setExtensionMonths] = useState<number>(1);
  const [deletingMember, setDeletingMember] = useState<GymMember | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cancel & Refund States
  const [cancellingMember, setCancellingMember] = useState<GymMember | null>(null);
  const [refundType, setRefundType] = useState<'FULL' | 'PRORATED' | 'CREDIT' | 'MANUAL'>('PRORATED');
  const [manualAmount, setManualAmount] = useState<number>(0);
  const [refundNotes, setRefundNotes] = useState<string>('');

  const calculatedRefundAmount = useMemo(() => {
    if (!cancellingMember) return 0;
    const matchedPlan = plans.find((p) => p.title.toLowerCase() === cancellingMember.planTitle.toLowerCase());
    const totalAmount = matchedPlan?.price || 150000;

    if (refundType === 'FULL') {
      return totalAmount;
    }
    if (refundType === 'CREDIT') {
      return 0;
    }
    if (refundType === 'MANUAL') {
      return manualAmount;
    }
    // Prorated refund calculation
    try {
      const start = new Date(cancellingMember.startDate);
      const exp = new Date(cancellingMember.expirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const totalTime = exp.getTime() - start.getTime();
      const remainingTime = exp.getTime() - today.getTime();

      if (totalTime <= 0) return 0;
      const ratio = Math.max(0, Math.min(1, remainingTime / totalTime));
      return Math.round(totalAmount * ratio);
    } catch {
      return Math.round(totalAmount / 2); // Fallback to 50%
    }
  }, [cancellingMember, refundType, manualAmount, plans]);

  const handleConfirmCancellation = async () => {
    if (!cancellingMember) return;
    await dashboard.cancelAndRefundMember(
      cancellingMember.id,
      refundType,
      refundType === 'MANUAL' ? manualAmount : undefined,
      refundNotes
    );
    setCancellingMember(null);
    showToast(`Processed ${refundType} cancellation and refund of ${calculatedRefundAmount.toLocaleString()} MNT.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Filtered members list using domain service
  const filteredMembers = useMemo(() => {
    return filterMembers(members, searchQuery, activeFilter);
  }, [members, activeFilter, searchQuery]);

  // Open Edit Modal
  const handleOpenEdit = (member: GymMember) => {
    setEditingMember(member);
    setExtensionMonths(1);
  };

  // Step ticker increment / decrement
  const handleStepDuration = (delta: number) => {
    setExtensionMonths((prev) => Math.max(1, prev + delta));
  };

  // Save Extension & Log Changes
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const matchedPlan = plans.find((p) => p.title.toLowerCase() === editingMember.planTitle.toLowerCase());
    const calculatedFee = calculateExtensionFee(matchedPlan, extensionMonths, 100);
    const calculatedNewExpDate = computeNewExpirationDate(editingMember.expirationDate, extensionMonths);

    if (propOnUpdateMember) {
      dashboard.extendMember(editingMember.id, extensionMonths, calculatedFee, 'Cash', calculatedNewExpDate);
    } else {
      dashboard.extendMember(editingMember.id, extensionMonths, calculatedFee, 'Cash', calculatedNewExpDate);
    }

    setEditingMember(null);
    showToast(t('extendSuccess', { name: `${editingMember.firstName} ${editingMember.lastName}` }));
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingMember) return;
    if (propOnDeleteMember) {
      propOnDeleteMember(deletingMember.id);
    } else {
      dashboard.deleteMember(deletingMember.id);
    }
    showToast(t('deleteSuccess'));
    setDeletingMember(null);
  };

  const filterTabs: TabItem<MemberFilterTab>[] = [
    { id: 'all', label: t('tabAll'), count: members.length },
    { id: 'active', label: t('tabActive'), count: members.filter((m) => m.status === 'Active').length },
    { id: 'unpaid', label: t('tabUnpaid'), count: members.filter((m) => m.status === 'Suspended').length },
    { id: 'expired', label: t('tabExpired'), count: members.filter((m) => m.status === 'Expired').length },
    { id: 'in-gym', label: t('tabInGym'), count: members.filter((m) => m.occupancyStatus === 'Checked In').length },
    {
      id: 'expiring',
      label: t('tabExpiring'),
      count: members.filter((m) => {
        if (m.status !== 'Active' || !m.expirationDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expDate = new Date(m.expirationDate);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / 86400000);
        return diffDays >= 0 && diffDays <= 7;
      }).length,
    },
  ];

  return (
    <div id="member-directory-root" className="space-y-6 pb-16">
      {/* Toast Notification */}
      <Toast id="directory-toast" message={toastMessage} type="success" />

      {/* Top Search & Filter Bar */}
      <div
        id="directory-search-filter-bar"
        className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
      >
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-xl">
          <Input
            id="input-search-members"
            icon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
          />
        </div>

        {/* Right: Filter Tabs */}
        <TabsList
          id="directory-filter-tabs"
          tabs={filterTabs}
          activeTab={activeFilter}
          onTabChange={(tab) => {
            setActiveFilter(tab as MemberFilterTab);
            dashboard.setDirectoryFilter(tab);
          }}
          variant="boxed"
        />
      </div>

      {/* Member Directory Table Card */}
      <Card id="card-member-directory-table" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {filteredMembers.length === 0 ? (
            <div
              id="empty-directory-state"
              className="py-16 text-center space-y-4 p-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-muted border border-border mx-auto flex items-center justify-center text-muted-foreground">
                <User className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div className="space-y-1 max-w-md mx-auto px-4">
                <h3 className="text-sm font-bold text-foreground">
                  {t('noMembers')}
                </h3>
              </div>
              {onNavigateToRegistration && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onNavigateToRegistration}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-2 stroke-[2.5]" />
                  <span>{t('addNewMemberBtn')}</span>
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider font-mono font-bold bg-muted/30">
                  <th className="py-3.5 px-4">{t('colMember')}</th>
                  <th className="py-3.5 px-4">{t('colPlan')}</th>
                  <th className="py-3.5 px-4">{t('colExpiration')}</th>
                  <th className="py-3.5 px-4">{t('colOccupancy')}</th>
                  <th className="py-3.5 px-4 text-right">{t('colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMembers.map((member) => {
                  const isCheckedIn = member.occupancyStatus === 'Checked In';
                  const isSuspended = member.status === 'Suspended';

                  return (
                    <tr
                      key={member.id}
                      id={`member-row-${member.id}`}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Column 1: ATHLETE ID & NAME */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-muted border border-border shrink-0 overflow-hidden flex items-center justify-center">
                            {member.photoUrl || member.profileImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={member.photoUrl || member.profileImage}
                                alt={`${member.firstName} ${member.lastName}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-foreground text-xs uppercase tracking-wide">
                                {member.firstName} {member.lastName}
                              </span>
                              <Badge variant="primary">{member.id}</Badge>
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: MEMBERSHIP PLAN */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-bold text-foreground text-xs tracking-wide">
                            {member.planTitle || 'Standard Membership'}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            Started: {member.startDate || '2026-08-21'}
                          </div>
                        </div>
                      </td>

                      {/* Column 3: EXPIRATION DATE */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-primary">
                          <Calendar className="w-3.5 h-3.5 shrink-0 stroke-[2]" />
                          <span>{member.expirationDate}</span>
                        </div>
                      </td>

                      {/* Column 4: STATUS */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          {member.status === 'Active' ? (
                            <>
                              <Badge variant="success">Active</Badge>
                              {(() => {
                                if (!member.expirationDate) return null;
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const expDate = new Date(member.expirationDate);
                                const diffTime = expDate.getTime() - today.getTime();
                                const diffDays = Math.ceil(diffTime / 86400000);
                                if (diffDays >= 0 && diffDays <= 7) {
                                  return (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30 font-mono animate-pulse">
                                      ⚠️ Expiring Soon
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </>
                          ) : isSuspended ? (
                            <Badge variant="warning">Unpaid</Badge>
                          ) : (
                            <Badge variant="destructive">Expired</Badge>
                          )}
                        </div>
                      </td>

                      {/* Column 5: ACTIONS */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Button
                            id={`btn-edit-duration-${member.id}`}
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenEdit(member)}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-primary mr-1.5" />
                            <span>{t('extendBtn')}</span>
                          </Button>

                          <Button
                            id={`btn-cancel-refund-${member.id}`}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCancellingMember(member);
                              setRefundType('PRORATED');
                              setManualAmount(0);
                              setRefundNotes('');
                            }}
                            disabled={member.status === 'Cancelled' || member.status === 'Refunded'}
                            className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                          >
                            <span>Cancel & Refund</span>
                          </Button>

                          <Button
                            id={`btn-delete-member-${member.id}`}
                            variant="destructive"
                            size="icon"
                            onClick={() => setDeletingMember(member)}
                            title="Delete Member"
                            className="h-8 w-8 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* ================= MODAL 1: REGISTER MEMBERSHIP EXTENSION ================= */}
      <Modal
        id="modal-edit-duration"
        isOpen={Boolean(editingMember)}
        onClose={() => setEditingMember(null)}
        title={
          editingMember
            ? t('extendModalTitle', { name: `${editingMember.firstName} ${editingMember.lastName}` })
            : 'Extend Membership'
        }
        maxWidth="md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingMember(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveEdit}
            >
              <CheckCircle2 className="w-4 h-4 mr-2 stroke-[2.5]" />
              <span>Confirm Extension</span>
            </Button>
          </>
        }
      >
        {editingMember && (
          <div className="space-y-4">
            {/* Registered Membership Plan Card */}
            <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  Registered Plan
                </span>
                <Badge
                  variant={
                    editingMember.status === 'Active'
                      ? 'success'
                      : editingMember.status === 'Expired'
                      ? 'destructive'
                      : 'warning'
                  }
                >
                  {editingMember.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {editingMember.planTitle || 'Standard Membership'}
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    Registered on: {editingMember.startDate || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {t('currentExp')}
                  </p>
                  <p className="text-xs font-mono font-bold text-foreground mt-0.5">
                    {editingMember.expirationDate || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stepper Ticker */}
            <div
              id="card-membership-duration-ticker"
              className="bg-muted/40 border border-border rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground tracking-wide">
                  {t('extendMonthsLabel')}
                </h4>
                <p className="text-xs text-muted-foreground font-mono">
                  Adjust in 1-month increments
                </p>
              </div>

              <div className="bg-background border border-border p-1 rounded-xl flex items-center gap-2">
                <Button
                  id="btn-decrement-duration"
                  variant="outline"
                  size="icon"
                  onClick={() => handleStepDuration(-1)}
                  disabled={extensionMonths <= 1}
                  className="h-8 w-8 rounded-lg"
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>

                <div className="px-2 min-w-[70px] text-center font-mono select-none">
                  <span className="text-primary font-black text-sm mr-1">
                    {extensionMonths}
                  </span>
                  <span className="text-foreground font-bold text-xs">
                    {extensionMonths === 1 ? 'Month' : 'Months'}
                  </span>
                </div>

                <Button
                  id="btn-increment-duration"
                  variant="primary"
                  size="icon"
                  onClick={() => handleStepDuration(1)}
                  className="h-8 w-8 rounded-lg"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </Button>
              </div>
            </div>

            {/* Calculated Expiration Date Readout */}
            <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>{t('newExp')}</span>
                </label>
                <Badge variant="primary">
                  +{extensionMonths} {extensionMonths === 1 ? 'Month' : 'Months'}
                </Badge>
              </div>

              <div className="flex items-center justify-between bg-background border border-border rounded-lg px-3.5 py-2.5">
                <span className="text-xs text-muted-foreground font-mono">
                  {t('newExp')}
                </span>
                <span className="text-sm font-mono font-bold text-primary tracking-wider">
                  {computeNewExpirationDate(editingMember.expirationDate, extensionMonths)}
                </span>
              </div>
            </div>

            {/* Quick 1-Click Renew Buttons */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">
                  ⚡ Quick Renew Actions
                </span>
                <span className="text-[9px] text-muted-foreground font-mono">1-click immediate renewal</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  id="btn-quick-renew-1m"
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    const matchedPlan = plans.find((p) => p.title.toLowerCase() === editingMember.planTitle.toLowerCase());
                    const calculatedFee = calculateExtensionFee(matchedPlan, 1, 100);
                    const calculatedNewExpDate = computeNewExpirationDate(editingMember.expirationDate, 1);
                    dashboard.extendMember(editingMember.id, 1, calculatedFee, 'Cash', calculatedNewExpDate);
                    setEditingMember(null);
                    showToast(t('extendSuccess', { name: `${editingMember.firstName} ${editingMember.lastName}` }));
                  }}
                  className="w-full text-xs font-bold"
                >
                  ⚡ +1 Month Quick Renew
                </Button>
                <Button
                  id="btn-quick-renew-3m"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    const matchedPlan = plans.find((p) => p.title.toLowerCase() === editingMember.planTitle.toLowerCase());
                    const calculatedFee = calculateExtensionFee(matchedPlan, 3, 100);
                    const calculatedNewExpDate = computeNewExpirationDate(editingMember.expirationDate, 3);
                    dashboard.extendMember(editingMember.id, 3, calculatedFee, 'Cash', calculatedNewExpDate);
                    setEditingMember(null);
                    showToast(t('extendSuccess', { name: `${editingMember.firstName} ${editingMember.lastName}` }));
                  }}
                  className="w-full text-xs font-bold border-primary/20 text-primary hover:bg-primary/10"
                >
                  ⚡ +3 Months Quick Renew
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= MODAL 2: DELETE CONFIRMATION ================= */}
      <Modal
        id="modal-delete-member"
        isOpen={Boolean(deletingMember)}
        onClose={() => setDeletingMember(null)}
        title={t('deleteConfirmTitle')}
        maxWidth="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingMember(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        {deletingMember && (
          <div className="text-center space-y-3 py-2">
            <div className="w-12 h-12 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {t('deleteConfirmDesc', { name: `${deletingMember.firstName} ${deletingMember.lastName}` })}
            </p>
          </div>
        )}
      </Modal>

      {/* ================= MODAL 3: CANCEL & REFUND PLAN ================= */}
      <Modal
        id="modal-cancel-refund"
        isOpen={Boolean(cancellingMember)}
        onClose={() => setCancellingMember(null)}
        title={cancellingMember ? `Cancel & Refund Membership: ${cancellingMember.firstName} ${cancellingMember.lastName}` : "Cancel & Refund Membership"}
        maxWidth="md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancellingMember(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancellation}
              disabled={dashboard.isLoading}
            >
              {dashboard.isLoading ? 'Processing...' : 'Confirm Cancellation & Refund'}
            </Button>
          </>
        }
      >
        {cancellingMember && (
          <div className="space-y-4">
            {/* Member Plan Details */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-wider">Active Plan</span>
                <Badge variant="primary">{cancellingMember.planTitle}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Start Date</span>
                  <span className="font-bold text-foreground">{cancellingMember.startDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Expiration Date</span>
                  <span className="font-bold text-foreground">{cancellingMember.expirationDate}</span>
                </div>
              </div>
            </div>

            {/* Refund Calculation Options */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                Refund Method / Calculation Rule
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'FULL', label: 'Full Refund', desc: '100% money back' },
                  { id: 'PRORATED', label: 'Prorated', desc: 'Remaining days ratio' },
                  { id: 'CREDIT', label: 'Store Credit', desc: 'Convert to gym balance' },
                  { id: 'MANUAL', label: 'Manual Override', desc: 'Custom direct refund' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setRefundType(opt.id as any)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-0.5 transition-all ${
                      refundType === opt.id
                        ? 'border-red-500 bg-red-500/5 ring-1 ring-red-500'
                        : 'border-border bg-background hover:bg-muted/40'
                    }`}
                  >
                    <span className="text-xs font-black text-foreground">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Override input field */}
            {refundType === 'MANUAL' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                  Custom Refund Amount (₮ MNT)
                </label>
                <Input
                  id="input-manual-refund-amount"
                  type="number"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(Number(e.target.value))}
                  placeholder="Enter custom MNT refund amount"
                />
              </div>
            )}

            {/* Refund Notes field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                Cancellation Notes / Reason
              </label>
              <Input
                id="input-refund-notes"
                value={refundNotes}
                onChange={(e) => setRefundNotes(e.target.value)}
                placeholder="Reason for cancellation (e.g., relocating, injury)"
              />
            </div>

            {/* Live Interactive Preview Card */}
            <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  Refund Preview Breakdown
                </span>
                <Badge variant="success">Active calculation</Badge>
              </div>

              <div className="divide-y divide-border text-xs font-mono space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Plan Total Value:</span>
                  <span className="font-bold text-foreground">
                    {((plans.find((p) => p.title.toLowerCase() === cancellingMember.planTitle.toLowerCase())?.price || 150000)).toLocaleString()} MNT
                  </span>
                </div>
                {refundType === 'PRORATED' && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Elapsed Days Ratio:</span>
                    <span className="font-bold text-foreground text-red-500">
                      {(() => {
                        const start = new Date(cancellingMember.startDate);
                        const exp = new Date(cancellingMember.expirationDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const total = exp.getTime() - start.getTime();
                        const rem = exp.getTime() - today.getTime();
                        if (total <= 0) return '0%';
                        const ratio = Math.max(0, Math.min(1, rem / total));
                        return `${Math.round(ratio * 100)}% remaining`;
                      })()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2.5 text-sm font-black border-t border-border">
                  <span className="text-foreground">Estimated Refund Amount:</span>
                  <span className="text-primary font-black tracking-wide text-base">
                    {calculatedRefundAmount.toLocaleString()} MNT
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
