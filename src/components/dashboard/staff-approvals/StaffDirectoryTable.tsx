'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, Trash2 } from 'lucide-react';
import { StaffAccount } from '@/features/staff';
import { DataTable, Column } from '../DataTable';

interface StaffDirectoryTableProps {
  staffList: StaffAccount[];
  onDeleteStaff: (id: string) => void;
  onOpenResetPasswordModal: (staff: StaffAccount) => void;
}

export function StaffDirectoryTable({
  staffList,
  onDeleteStaff,
  onOpenResetPasswordModal,
}: StaffDirectoryTableProps) {
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  const togglePasswordReveal = (id: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const columns: Column<StaffAccount>[] = [
    {
      key: 'fullName',
      header: 'Staff Member',
      accessor: (s) => (
        <div>
          <span className="font-bold text-foreground font-sans">{s.fullName}</span>
          <span className="block text-[10px] text-muted-foreground font-mono">@{s.username}</span>
        </div>
      ),
      sortable: true,
      sortValue: (s) => s.fullName,
    },
    {
      key: 'role',
      header: 'System Role',
      accessor: (s) => <span className="text-muted-foreground uppercase text-[10px] font-mono">{s.role}</span>,
      sortable: true,
      sortValue: (s) => s.role,
    },
    {
      key: 'assignedShift',
      header: 'Assigned Shift',
      accessor: (s) => <span className="text-slate-300 font-mono text-[10px]">{s.assignedShift}</span>,
      sortable: true,
      sortValue: (s) => s.assignedShift || '',
    },
    {
      key: 'status',
      header: 'Account Status',
      accessor: (s) => (
        <span
          className={`font-bold px-2 py-0.5 rounded text-[10px] font-mono ${
            s.status === 'Active'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : s.status === 'Pending'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}
        >
          {s.status}
        </span>
      ),
      sortable: true,
      sortValue: (s) => s.status,
    },
    {
      key: 'password',
      header: 'Password (Demo)',
      accessor: (s) => (
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-[11px] text-slate-300">
            {revealedPasswords[s.id]
              ? s.plainTextPasswordForDemo || '••••••••'
              : '••••••••'}
          </span>
          <button
            type="button"
            onClick={() => togglePasswordReveal(s.id)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            title="Toggle Password Visibility"
          >
            {revealedPasswords[s.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (s) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenResetPasswordModal(s)}
            className="p-1.5 bg-[#070D1E] hover:bg-muted/30 border border-border/60 rounded text-sky-400 cursor-pointer"
            title="Reset Staff Password"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteStaff(s.id)}
            className="p-1.5 bg-[#070D1E] hover:bg-rose-500/20 border border-rose-500/30 rounded text-rose-400 cursor-pointer"
            title="Delete Staff Account"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={staffList}
      columns={columns}
      keyExtractor={(s) => s.id}
      searchPlaceholder="Search staff by name, username, role..."
      searchFilter={(s, q) =>
        s.fullName.toLowerCase().includes(q.toLowerCase()) ||
        s.username.toLowerCase().includes(q.toLowerCase()) ||
        s.role.toLowerCase().includes(q.toLowerCase())
      }
      emptyMessage="No staff accounts registered."
    />
  );
}
