'use client';

import React from 'react';
import { Users, Target, Calendar } from 'lucide-react';
import { GymMember } from '@/lib/types';
import { StatCard } from '../StatCard';
import { DataTable, Column } from '../DataTable';
import { formatCurrency } from '@/lib/utils';
import { aggregateExtensionMetrics } from '@/features/reporting';

interface MembersTabProps {
  members: GymMember[];
}

export function MembersTab({ members }: MembersTabProps) {
  const extensionMetrics = aggregateExtensionMetrics(members);

  const extensionLogs = extensionMetrics.allLogs;

  const logColumns: Column<typeof extensionLogs[number]>[] = [
    {
      key: 'memberName',
      header: 'Member Name',
      accessor: (log) => <span className="font-bold text-foreground">{log.memberName}</span>,
      sortable: true,
      sortValue: (l) => l.memberName,
    },
    {
      key: 'memberCategory',
      header: 'Category',
      accessor: (log) => (
        <span className="text-muted-foreground uppercase text-[10px] px-1.5 py-0.5 bg-[#070D1E] border border-border/60 rounded">
          {log.memberCategory}
        </span>
      ),
      sortable: true,
      sortValue: (l) => l.memberCategory,
    },
    {
      key: 'monthsAdded',
      header: 'Extension Duration',
      accessor: (log) => <span className="text-[#D4FF00] font-bold">{log.monthsAdded} month(s)</span>,
      sortable: true,
      sortValue: (l) => l.monthsAdded,
    },
    {
      key: 'feePaid',
      header: 'Fee Paid (₮)',
      accessor: (log) => <span className="font-mono font-bold text-foreground">{formatCurrency(log.feePaid || 0)}</span>,
      sortable: true,
      sortValue: (l) => l.feePaid || 0,
    },
    {
      key: 'extendedAt',
      header: 'Date Processed',
      accessor: (log) => (
        <span className="text-[10px] text-muted-foreground font-mono">
          {log.extendedAt ? new Date(log.extendedAt).toLocaleDateString() : '—'}
        </span>
      ),
      sortable: true,
      sortValue: (l) => l.extendedAt || '',
    },
  ];

  return (
    <div className="space-y-4 font-sans animate-in fade-in duration-150">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          title="Total Registered Members"
          value={members.length}
          subtitle="Profiles in system directory"
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Member Renewal Rate"
          value={extensionMetrics.renewalPercentage}
          subtitle={`${extensionMetrics.uniqueMembersCount} members extended plans`}
          icon={Target}
          variant="success"
        />
        <StatCard
          title="Top Extension Period"
          value={extensionMetrics.topPeriodLabel}
          subtitle={`${extensionMetrics.totalTransactions} total extension transactions`}
          icon={Calendar}
          variant="info"
        />
      </div>

      {/* Extension History Audit Logs */}
      <div className="bg-[#0B132B]/80 border border-border/80 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
            Extension History Audit Log
          </h3>
          <span className="text-[10px] font-mono text-muted-foreground">
            {extensionLogs.length} total extension records
          </span>
        </div>

        <DataTable
          data={extensionLogs}
          columns={logColumns}
          keyExtractor={(l) => `${l.memberId}-${l.extendedAt}-${l.feePaid}`}
          searchPlaceholder="Search extension logs..."
          searchFilter={(l, q) =>
            l.memberName.toLowerCase().includes(q.toLowerCase()) ||
            l.memberCategory.toLowerCase().includes(q.toLowerCase())
          }
          emptyMessage="No extension history recorded."
        />
      </div>
    </div>
  );
}
