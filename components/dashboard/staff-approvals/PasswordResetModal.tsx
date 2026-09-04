'use client';

import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, X } from 'lucide-react';
import { StaffAccount } from '@/lib/types';
import { hashPassword } from '@/lib/security/password';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffAccount | null;
  onConfirmReset: (staffId: string, newPassword: string, hash: string) => void;
}

export function PasswordResetModal({
  isOpen,
  onClose,
  staff,
  onConfirmReset,
}: PasswordResetModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen || !staff) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) return;

    const hash = await hashPassword(newPassword);
    onConfirmReset(staff.id, newPassword, hash);
    onClose();
    setNewPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-[#0B132B] border border-border rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#D4FF00]" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Reset Password</h3>
              <p className="text-[10px] text-muted-foreground font-mono">{staff.fullName} (@{staff.username})</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg pl-3 pr-8 py-2 outline-none"
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

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/80">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#D4FF00] hover:bg-[#c3eb00] text-black font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-md transition-all font-mono"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
