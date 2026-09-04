'use client';

import React, { useState } from 'react';
import { UserPlus, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { StaffAccount } from '@/lib/types';
import { STAFF_SHIFTS, STAFF_ROLES, DEFAULT_STAFF_PERMISSIONS } from '@/lib/services';
// NOTE: pre-existing architectural debt — password hashing runs client-side because the
// staff domain has no server action yet. Tracked for the Phase B "staff" feature extraction,
// which will replace this with a real server action that hashes server-side.
import { hashPassword } from '@/server/security/password';

interface StaffRegistrationFormProps {
  staffList: StaffAccount[];
  onAddStaff: (staff: StaffAccount) => void;
  showToast: (msg: string) => void;
}

export function StaffRegistrationForm({
  staffList,
  onAddStaff,
  showToast,
}: StaffRegistrationFormProps) {
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
  const [permissions, setPermissions] = useState<string[]>([...DEFAULT_STAFF_PERMISSIONS]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const togglePermission = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setErrorMessage('Please enter a username.');
      return;
    }

    if (cleanUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }

    const exists = staffList.some((s) => s.username.toLowerCase() === cleanUsername);
    if (exists) {
      setErrorMessage(`Username "${cleanUsername}" is already registered.`);
      return;
    }

    if (!password || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Please enter the full name.');
      return;
    }

    const newId = `staff-${Date.now()}`;
    const passwordHash = await hashPassword(password);

    const newStaff: StaffAccount = {
      id: newId,
      username: cleanUsername,
      passwordHash,
      plainTextPasswordForDemo: password,
      fullName: fullName.trim(),
      email: email.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      role,
      assignedShift,
      status: initialStatus,
      registeredAt: new Date().toISOString(),
      registeredBy: 'usr-admin',
      notes: notes.trim() || undefined,
      permissions,
    };

    onAddStaff(newStaff);
    showToast(`Staff member "${fullName.trim()}" registered successfully!`);

    // Reset Form
    setUsername('');
    setPassword('');
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setNotes('');
    setPermissions([...DEFAULT_STAFF_PERMISSIONS]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 font-sans">
      {errorMessage && (
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs font-mono">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
            Username *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. bat_reception"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-3 py-1.5 outline-none font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg pl-3 pr-8 py-1.5 outline-none font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
            Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Bat-Erdene Bold"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-3 py-1.5 outline-none font-sans"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
            Phone Number
          </label>
          <input
            type="text"
            placeholder="+976 9911-2233"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-3 py-1.5 outline-none font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
            Email Address
          </label>
          <input
            type="email"
            placeholder="staff@arche.fitness"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-3 py-1.5 outline-none font-sans"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
            System Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as StaffAccount['role'])}
            className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-2.5 py-1.5 outline-none font-mono"
          >
            {STAFF_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
            Shift Assignment
          </label>
          <select
            value={assignedShift}
            onChange={(e) => setAssignedShift(e.target.value)}
            className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-2.5 py-1.5 outline-none font-mono"
          >
            {STAFF_SHIFTS.map((s) => (
              <option key={s.id} value={s.labelEn}>
                {s.labelEn}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
            Initial Status
          </label>
          <select
            value={initialStatus}
            onChange={(e) => setInitialStatus(e.target.value as 'Active' | 'Pending')}
            className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-2.5 py-1.5 outline-none font-mono"
          >
            <option value="Active">Active (Immediate Login)</option>
            <option value="Pending">Pending Admin Approval</option>
          </select>
        </div>
      </div>

      {/* Permissions Checkboxes */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
          System Module Permissions
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          {[
            { id: 'checkin', label: 'Check-In Scans' },
            { id: 'registration', label: 'Member Registration' },
            { id: 'member_edit', label: 'Member Profile Edit' },
            { id: 'locker_assign', label: 'Locker Assignment' },
            { id: 'nutrient_sales', label: 'Nutrient POS Sales' },
            { id: 'extension_process', label: 'Plan Extensions' },
            { id: 'analytics_view', label: 'Analytics Reports' },
            { id: 'inventory_admin', label: 'Inventory Admin' },
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-1.5 p-2 bg-[#070D1E] border border-border/60 rounded-lg cursor-pointer hover:border-[#D4FF00]/50 select-none"
            >
              <input
                type="checkbox"
                checked={permissions.includes(item.id)}
                onChange={() => togglePermission(item.id)}
                className="accent-[#D4FF00] rounded cursor-pointer"
              />
              <span className="text-[11px] text-foreground">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          className="bg-[#D4FF00] hover:bg-[#c3eb00] text-black font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-md transition-all flex items-center gap-1.5 font-mono"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Register Staff Account</span>
        </button>
      </div>
    </form>
  );
}
