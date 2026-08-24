'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ShieldCheck,
  UserPlus,
  User,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Briefcase,
  Phone,
  Mail,
  Trash2,
  Check,
  Shield,
} from 'lucide-react';
import { StaffAccount, AuthUser } from '@/lib/types';
import { Button, Card, Badge, Input } from '@/components/ui';
import { useDashboard } from '@/lib/orchestration';
import { STAFF_SHIFTS, STAFF_ROLES, DEFAULT_STAFF_PERMISSIONS } from '@/lib/services';

interface StaffApprovalsViewProps {
  currentUser?: AuthUser;
  staffList?: StaffAccount[];
  onAddStaff?: (staff: StaffAccount) => void;
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

  // Form State for Registering Staff
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<StaffAccount['role']>('Front Desk Staff');
  const [assignedShift, setAssignedShift] = useState<string>(STAFF_SHIFTS[0].labelEn);
  const [initialStatus, setInitialStatus] = useState<'Active' | 'Pending'>('Active');
  const [notes, setNotes] = useState('');

  // Custom permissions
  const [permissions, setPermissions] = useState<string[]>([...DEFAULT_STAFF_PERMISSIONS]);

  // UI Feedback
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Pending' | 'Suspended'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Password Reveal / Reset Modal State
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  const isAdmin = !currentUser || currentUser.role === 'admin';

  const togglePermission = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const togglePasswordReveal = (id: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleRegisterStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessToast(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setErrorMessage('Please enter a username.');
      return;
    }

    if (cleanUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }

    // Check unique username
    const exists = staffList.some(
      (s) => s.username.toLowerCase() === cleanUsername
    );
    if (exists) {
      setErrorMessage(`A staff member with username "${cleanUsername}" already exists.`);
      return;
    }

    if (!password || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Please provide the staff member full name.');
      return;
    }

    const newStaff: StaffAccount = {
      id: `staff-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUsername,
      passwordHash: password,
      fullName: fullName.trim(),
      email: email.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      role,
      status: initialStatus,
      registeredAt: new Date().toISOString().split('T')[0],
      registeredBy: currentUser?.name ? `${currentUser.name} (${currentUser.badge})` : 'Administrator',
      assignedShift,
      permissions,
      notes: notes.trim() || undefined,
    };

    if (propOnAddStaff) {
      propOnAddStaff(newStaff);
    } else {
      dashboard.addStaff(newStaff);
    }

    // Reset Form
    setUsername('');
    setPassword('');
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setNotes('');
    setSuccessToast(t('staffRegisteredSuccess', { name: `@${cleanUsername}` }));

    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  const handleStatusChange = (staff: StaffAccount, newStatus: StaffAccount['status']) => {
    const updated = {
      ...staff,
      status: newStatus,
    };
    if (propOnUpdateStaff) {
      propOnUpdateStaff(updated);
    } else {
      dashboard.updateStaff(updated);
    }
  };

  const handleSavePasswordReset = (staff: StaffAccount) => {
    if (!newPasswordInput || newPasswordInput.length < 4) {
      alert('Password must be at least 4 characters.');
      return;
    }

    const updated = {
      ...staff,
      passwordHash: newPasswordInput,
    };

    if (propOnUpdateStaff) {
      propOnUpdateStaff(updated);
    } else {
      dashboard.updateStaff(updated);
    }

    setEditingStaffId(null);
    setNewPasswordInput('');
    setShowEditPassword(false);
  };

  const handleDeleteStaff = (id: string) => {
    if (propOnDeleteStaff) {
      propOnDeleteStaff(id);
    } else {
      dashboard.deleteStaff(id);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.username.toLowerCase().includes(q) ||
      s.fullName.toLowerCase().includes(q) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.phoneNumber && s.phoneNumber.includes(q));

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalActive = staffList.filter((s) => s.status === 'Active').length;
  const totalPending = staffList.filter((s) => s.status === 'Pending').length;

  return (
    <div id="staff-approvals-view-root" className="space-y-6 pb-12">
      {/* Top Banner / Header */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-primary shadow-md">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">
                {t('title')}
              </h1>
              <Badge variant="primary">
                {isAdmin ? 'Admin Panel' : 'Staff Access'}
              </Badge>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2 bg-background border border-border p-1.5 rounded-2xl">
          <div className="px-3 py-1.5 rounded-xl bg-muted text-center">
            <span className="text-[10px] font-mono text-muted-foreground block font-bold">TOTAL</span>
            <span className="text-sm font-black font-mono text-foreground">{staffList.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <span className="text-[10px] font-mono text-emerald-400 block font-bold">ACTIVE</span>
            <span className="text-sm font-black font-mono text-emerald-400">{totalActive}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
            <span className="text-[10px] font-mono text-amber-400 block font-bold">PENDING</span>
            <span className="text-sm font-black font-mono text-amber-400">{totalPending}</span>
          </div>
        </div>
      </Card>

      {/* ================= SECTION 1: ADMIN REGISTER STAFF FORM ================= */}
      <Card
        id="card-register-staff-form"
        className="p-6 shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="text-base font-extrabold text-foreground tracking-wide">
              {t('newStaffRegistration')}
            </h2>
          </div>
          <Badge variant="outline">
            Admin Authorized
          </Badge>
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 p-3.5 bg-destructive/10 border border-destructive/30 rounded-2xl text-destructive text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successToast && (
          <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        <form onSubmit={handleRegisterStaff} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>{t('usernameLabel')}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                  @
                </span>
                <input
                  id="input-staff-username"
                  type="text"
                  required
                  placeholder={t('usernamePlaceholder')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full bg-input border border-border focus:border-primary text-foreground text-xs font-mono rounded-xl pl-8 pr-3.5 py-2.5 outline-none transition-all"
                />
              </div>
            </div>

            {/* 2. Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span>{t('passwordLabel')}</span>
              </label>
              <div className="relative">
                <input
                  id="input-staff-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={t('passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-input border border-border focus:border-primary text-foreground text-xs font-mono rounded-xl pl-3.5 pr-10 py-2.5 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 3. Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                <span>{t('fullNameLabel')}</span>
              </label>
              <input
                id="input-staff-fullname"
                type="text"
                required
                placeholder={t('fullNamePlaceholder')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-input border border-border focus:border-primary text-foreground text-xs font-mono rounded-xl px-3.5 py-2.5 outline-none transition-all"
              />
            </div>

            {/* 4. Role / Position */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>{t('roleLabel')}</span>
              </label>
              <select
                id="select-staff-role"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-input border border-border focus:border-primary text-foreground text-xs font-mono rounded-xl px-3 py-2.5 outline-none cursor-pointer"
              >
                {STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Assigned Shift */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('shiftLabel')}</span>
              </label>
              <select
                id="select-staff-shift"
                value={assignedShift}
                onChange={(e) => setAssignedShift(e.target.value)}
                className="w-full bg-input border border-border focus:border-primary text-foreground text-xs font-mono rounded-xl px-3 py-2.5 outline-none cursor-pointer"
              >
                {STAFF_SHIFTS.map((s) => (
                  <option key={s.id} value={s.labelEn}>
                    {s.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Initial Approval Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('initialStatusLabel')}</span>
              </label>
              <select
                id="select-staff-status"
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value as any)}
                className="w-full bg-input border border-border focus:border-primary text-foreground text-xs font-mono rounded-xl px-3 py-2.5 outline-none cursor-pointer"
              >
                <option value="Active">Active (Approved)</option>
                <option value="Pending">Pending Review</option>
              </select>
            </div>

            {/* 7. Contact Email (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{t('emailLabel')}</span>
              </label>
              <input
                id="input-staff-email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-input border border-border focus:border-primary text-foreground text-xs font-mono rounded-xl px-3.5 py-2.5 outline-none transition-all"
              />
            </div>

            {/* 8. Phone Number (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{t('phoneLabel')}</span>
              </label>
              <input
                id="input-staff-phone"
                type="tel"
                placeholder={t('phonePlaceholder')}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-input border border-border focus:border-primary text-foreground text-xs font-mono rounded-xl px-3.5 py-2.5 outline-none transition-all"
              />
            </div>

            {/* 9. Internal Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{t('notesLabel')}</span>
              </label>
              <input
                id="input-staff-notes"
                type="text"
                placeholder={t('notesPlaceholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-input border border-border focus:border-primary text-foreground text-xs font-mono rounded-xl px-3.5 py-2.5 outline-none transition-all"
              />
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="bg-background border border-border rounded-2xl p-4 space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">
              {t('permissionsLabel')}
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                'Check-In & Locker Desk',
                'Member Registration',
                'Directory & Extensions',
                'Inventory Management',
                'Analytics Viewing',
              ].map((perm) => {
                const isSelected = permissions.includes(perm);
                return (
                  <button
                    key={perm}
                    type="button"
                    onClick={() => togglePermission(perm)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                    <span>{perm}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Registration Button */}
          <div className="flex justify-end pt-2">
            <Button
              id="btn-submit-register-staff"
              type="submit"
              variant="primary"
            >
              <UserPlus className="w-4 h-4 mr-2 stroke-[2.5]" />
              <span>{t('registerBtn')}</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* ================= SECTION 2: REGISTERED STAFF DIRECTORY ================= */}
      <Card
        id="card-staff-directory"
        className="p-6 shadow-xl space-y-5"
      >
        {/* Directory Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                {t('staffDirectoryTitle')}
              </h3>
              <p className="text-xs font-mono text-muted-foreground">
                {t('staffCountBadge', { count: staffList.length })}
              </p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="min-w-[200px]">
              <Input
                type="text"
                placeholder={t('searchStaffPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-3.5 h-3.5 text-muted-foreground" />}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-input border border-border text-foreground text-xs font-mono rounded-xl px-3 py-2 outline-none cursor-pointer"
            >
              <option value="all">{t('allStatuses')}</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-input border border-border text-foreground text-xs font-mono rounded-xl px-3 py-2 outline-none cursor-pointer"
            >
              <option value="all">{t('allRoles')}</option>
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Staff Table / Cards */}
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-muted text-muted-foreground text-[10px] uppercase font-bold border-b border-border">
                <th className="py-3.5 px-4">{t('colStaffMember')}</th>
                <th className="py-3.5 px-4">{t('colRoleShift')}</th>
                <th className="py-3.5 px-4">{t('colCredentials')}</th>
                <th className="py-3.5 px-4">{t('colStatus')}</th>
                <th className="py-3.5 px-4 text-right">{t('colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground font-mono">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-muted-foreground" />
                    <p className="text-xs font-bold text-foreground">
                      No staff members match filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const isPasswordRevealed = revealedPasswords[staff.id];
                  const isEditingPassword = editingStaffId === staff.id;

                  return (
                    <tr key={staff.id} className="hover:bg-muted/40 transition-colors">
                      {/* Name & Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-xs uppercase">
                            {staff.fullName.substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-foreground block">{staff.fullName}</span>
                            <span className="text-[11px] text-primary font-mono">@{staff.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Shift */}
                      <td className="py-3.5 px-4">
                        <span className="text-foreground font-semibold block">{staff.role}</span>
                        <span className="text-[10px] text-muted-foreground block font-mono">
                          {staff.assignedShift || 'Standard Shift'}
                        </span>
                      </td>

                      {/* Password / Reset */}
                      <td className="py-3.5 px-4">
                        {isEditingPassword ? (
                          <div className="flex items-center gap-1.5">
                            <div className="relative">
                              <input
                                type={showEditPassword ? 'text' : 'password'}
                                placeholder="New password"
                                value={newPasswordInput}
                                onChange={(e) => setNewPasswordInput(e.target.value)}
                                className="bg-background border border-primary text-foreground text-xs font-mono rounded-lg px-2 py-1 w-28 outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSavePasswordReset(staff)}
                              className="p-1 rounded bg-emerald-500 text-black hover:bg-emerald-600 transition-colors"
                              title="Save New Password"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStaffId(null);
                                setNewPasswordInput('');
                              }}
                              className="p-1 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Cancel"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-mono bg-background border border-border px-2 py-0.5 rounded text-[11px]">
                              {isPasswordRevealed ? staff.passwordHash : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordReveal(staff.id)}
                              className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                              title={isPasswordRevealed ? 'Hide password' : 'Show password'}
                            >
                              {isPasswordRevealed ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStaffId(staff.id);
                                setNewPasswordInput('');
                              }}
                              className="text-[10px] text-sky-400 hover:underline cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            staff.status === 'Active'
                              ? 'success'
                              : staff.status === 'Pending'
                              ? 'warning'
                              : 'destructive'
                          }
                        >
                          {staff.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Status Actions */}
                          {staff.status !== 'Active' && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(staff, 'Active')}
                              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 text-[10px]"
                            >
                              {t('approveBtn')}
                            </Button>
                          )}

                          {staff.status === 'Active' && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(staff, 'Suspended')}
                              className="text-destructive border-destructive/30 hover:bg-destructive/10 text-[10px]"
                            >
                              {t('suspendBtn')}
                            </Button>
                          )}

                          {/* Delete Staff */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove staff member @${staff.username}?`)) {
                                handleDeleteStaff(staff.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="Delete staff account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
