'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Lock, UserPlus, Bell } from 'lucide-react';
import { StaffAccount, AuthUser } from '@/lib/types';
import { Toast } from '@/components/ui';
import { useDashboard } from '@/lib/orchestration';
import { cn } from '@/lib/utils';
import {
  StaffRegistrationForm,
  ApprovalRequestsTab,
  StaffDirectoryTable,
  PasswordResetModal,
} from './staff-approvals';

interface StaffApprovalsViewProps {
  currentUser?: AuthUser;
  staffList?: StaffAccount[];
  onAddStaff?: (input: {
    username: string;
    password: string;
    fullName: string;
    email?: string;
    phoneNumber?: string;
    role: StaffAccount['role'];
    assignedShift?: string;
    status: 'Active' | 'Pending';
    notes?: string;
    permissions?: string[];
  }) => Promise<{ staff: StaffAccount | null; error?: string }>;
  onUpdateStaff?: (staff: StaffAccount) => void;
  onDeleteStaff?: (id: string) => void;
}

export default function StaffApprovalsView({
  currentUser: propCurrentUser,
  staffList: propStaffList,
  onAddStaff: propOnAddStaff,
  onUpdateStaff: propOnUpdateStaff,
  onDeleteStaff: propOnDeleteStaff,
}: StaffApprovalsViewProps) {
  const dashboard = useDashboard();
  const staffList = propStaffList ?? dashboard.staffList;
  const currentUser = propCurrentUser ?? dashboard.currentUser;

  const t = useTranslations('StaffApprovals');

  const [activeTab, setActiveTab] = useState<'register' | 'notifications'>('register');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Password reset modal state
  const [resetModalStaff, setResetModalStaff] = useState<StaffAccount | null>(null);

  const isAdmin = !currentUser || currentUser.role === 'admin';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAddStaff = (input: {
    username: string;
    password: string;
    fullName: string;
    email?: string;
    phoneNumber?: string;
    role: StaffAccount['role'];
    assignedShift?: string;
    status: 'Active' | 'Pending';
    notes?: string;
    permissions?: string[];
  }) => {
    if (propOnAddStaff) return propOnAddStaff(input);
    return dashboard.addStaff(input);
  };

  const handleDeleteStaff = (id: string) => {
    if (propOnDeleteStaff) propOnDeleteStaff(id);
    else dashboard.deleteStaff(id);
    showToast('Staff account deleted.');
  };

  const handleApproveStaff = (id: string) => {
    const target = staffList.find((s) => s.id === id);
    if (!target) return;
    const updated = { ...target, status: 'Active' as const };
    if (propOnUpdateStaff) propOnUpdateStaff(updated);
    else dashboard.updateStaff(updated);
    showToast(`Approved account for @${target.username}`);
  };

  const handleRejectStaff = (id: string) => {
    handleDeleteStaff(id);
  };

  const handleConfirmResetPassword = async (id: string, newPass: string): Promise<boolean> => {
    const target = staffList.find((s) => s.id === id);
    const ok = await dashboard.resetStaffPassword(id, newPass);
    if (ok && target) {
      showToast(`Password updated for @${target.username}`);
    }
    return ok;
  };

  if (!isAdmin) {
    return (
      <div id="staff-access-denied" className="w-full py-12 flex flex-col items-center justify-center text-center space-y-3 font-sans">
        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-foreground">{t('adminOnly') || 'Admin Access Only'}</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            Staff account management and registration permissions are restricted to Admin accounts.
          </p>
        </div>
      </div>
    );
  }

  const pendingCount = staffList.filter((s) => s.status === 'Pending').length;

  return (
    <div id="staff-approvals-view-root" className="w-full space-y-4 font-sans">
      <Toast message={toastMessage} type="success" />

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {t('title') || 'Staff Management & System Approvals'}
        </h1>
        <p className="text-xs text-muted-foreground font-mono">
          Register new staff accounts, set shift assignments, configure system permissions, and manage access approvals.
        </p>
      </div>

      {/* Primary Actions Card (Tabs for Register vs Approval Queue) */}
      <div className="bg-[#0B132B]/80 border border-border/80 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3 border-b border-border/80 pb-2.5 text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={cn(
              'flex items-center gap-1.5 pb-2 border-b-2 transition-all cursor-pointer',
              activeTab === 'register'
                ? 'text-[#D4FF00] border-[#D4FF00]'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>REGISTER STAFF ACCOUNT</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={cn(
              'flex items-center gap-1.5 pb-2 border-b-2 transition-all cursor-pointer relative',
              activeTab === 'notifications'
                ? 'text-[#D4FF00] border-[#D4FF00]'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>APPROVAL QUEUE</span>
            {pendingCount > 0 && (
              <span className="ml-1 text-[9px] px-1.5 py-0.2 bg-amber-500 text-black font-extrabold rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'register' ? (
          <StaffRegistrationForm
            staffList={staffList}
            onAddStaff={handleAddStaff}
            showToast={showToast}
          />
        ) : (
          <ApprovalRequestsTab
            staffList={staffList}
            onApprove={handleApproveStaff}
            onReject={handleRejectStaff}
          />
        )}
      </div>

      {/* Registered Staff Directory Table */}
      <div className="bg-[#0B132B]/80 border border-border/80 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border/80 pb-2.5 font-mono">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Registered Staff Directory
          </h3>
          <span className="text-[10px] text-muted-foreground">
            {staffList.length} total staff profiles
          </span>
        </div>

        <StaffDirectoryTable
          staffList={staffList}
          onDeleteStaff={handleDeleteStaff}
          onOpenResetPasswordModal={(staff) => setResetModalStaff(staff)}
        />
      </div>

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={!!resetModalStaff}
        onClose={() => setResetModalStaff(null)}
        staff={resetModalStaff}
        onConfirmReset={handleConfirmResetPassword}
      />
    </div>
  );
}
