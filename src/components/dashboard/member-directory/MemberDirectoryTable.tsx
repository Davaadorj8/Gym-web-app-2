'use client';

import React from 'react';
import { Calendar, Trash2, Edit3, XCircle } from 'lucide-react';
import { GymMember } from '@/lib/types';
import { DataTable, Column } from '../DataTable';

interface MemberDirectoryTableProps {
  members: GymMember[];
  onExtend: (member: GymMember) => void;
  onCancel: (member: GymMember) => void;
  onDelete: (member: GymMember) => void;
}

export function MemberDirectoryTable({
  members,
  onExtend,
  onCancel,
  onDelete,
}: MemberDirectoryTableProps) {
  const columns: Column<GymMember>[] = [
    {
      key: 'name',
      header: 'Member Name',
      accessor: (m) => (
        <div>
          <span className="font-bold text-foreground font-sans">
            {m.isOrganization && m.orgName ? m.orgName : `${m.firstName} ${m.lastName}`}
          </span>
          <span className="block text-[10px] text-muted-foreground font-mono">
            ID: {m.pinCode || m.id} | {m.phoneNumber || 'No phone'}
          </span>
        </div>
      ),
      sortable: true,
      sortValue: (m) => (m.isOrganization && m.orgName ? m.orgName : m.firstName),
    },
    {
      key: 'planTitle',
      header: 'Plan Title',
      accessor: (m) => <span className="text-muted-foreground font-mono text-[11px]">{m.planTitle}</span>,
      sortable: true,
      sortValue: (m) => m.planTitle,
    },
    {
      key: 'occupancyStatus',
      header: 'Check-In Status',
      accessor: (m) => (
        <span
          className={`font-bold px-2 py-0.5 rounded text-[10px] font-mono ${
            m.occupancyStatus === 'Checked In'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-muted/20 text-muted-foreground border border-border/40'
          }`}
        >
          {m.occupancyStatus}
        </span>
      ),
      sortable: true,
      sortValue: (m) => m.occupancyStatus,
    },
    {
      key: 'expirationDate',
      header: 'Expiration Date',
      accessor: (m) => (
        <span className="font-mono text-amber-400 text-[11px]">{m.expirationDate || 'N/A'}</span>
      ),
      sortable: true,
      sortValue: (m) => m.expirationDate || '',
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (m) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onExtend(m)}
            className="p-1.5 bg-[#070D1E] hover:bg-[#D4FF00]/10 border border-border/60 rounded text-[#D4FF00] cursor-pointer"
            title="Extend Membership"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onCancel(m)}
            className="p-1.5 bg-[#070D1E] hover:bg-amber-500/20 border border-amber-500/30 rounded text-amber-400 cursor-pointer"
            title="Cancel & Refund"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(m)}
            className="p-1.5 bg-[#070D1E] hover:bg-rose-500/20 border border-rose-500/30 rounded text-rose-400 cursor-pointer"
            title="Delete Member"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={members}
      columns={columns}
      keyExtractor={(m) => m.id}
      searchPlaceholder="Search by name, ID, plan..."
      searchFilter={(m, q) => {
        const name = m.isOrganization && m.orgName ? m.orgName : `${m.firstName} ${m.lastName}`;
        return (
          name.toLowerCase().includes(q.toLowerCase()) ||
          m.id.toLowerCase().includes(q.toLowerCase()) ||
          (m.pinCode && m.pinCode.toLowerCase().includes(q.toLowerCase())) ||
          m.planTitle.toLowerCase().includes(q.toLowerCase())
        );
      }}
      emptyMessage="No member profiles match your search criteria."
    />
  );
}
