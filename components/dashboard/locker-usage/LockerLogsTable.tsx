'use client';

import React from 'react';
import { LockerLog } from '@/lib/types';
import { DataTable, Column } from '../DataTable';

interface LockerLogsTableProps {
  logs: LockerLog[];
}

export function LockerLogsTable({ logs }: LockerLogsTableProps) {
  const columns: Column<LockerLog>[] = [
    {
      key: 'lockerNumber',
      header: 'Locker #',
      accessor: (log) => <span className="font-bold text-[#D4FF00] font-mono">{log.lockerNumber}</span>,
      sortable: true,
      sortValue: (l) => l.lockerNumber,
    },
    {
      key: 'memberName',
      header: 'Member / Staff',
      accessor: (log) => (
        <div>
          <span className="font-bold text-foreground font-sans">{log.memberName}</span>
          <span className="block text-[10px] text-muted-foreground font-mono">ID: {log.memberId}</span>
        </div>
      ),
      sortable: true,
      sortValue: (l) => l.memberName,
    },
    {
      key: 'eventType',
      header: 'Event Type',
      accessor: (log) => (
        <span
          className={`font-bold px-2 py-0.5 rounded text-[10px] font-mono ${
            log.eventType === 'Checked In'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}
        >
          {log.eventType}
        </span>
      ),
      sortable: true,
      sortValue: (l) => l.eventType,
    },
    {
      key: 'eventDescription',
      header: 'Event Description',
      accessor: (log) => <span className="text-muted-foreground text-[11px] font-mono">{log.eventDescription}</span>,
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      accessor: (log) => (
        <span className="text-[10px] text-muted-foreground font-mono">
          {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
        </span>
      ),
      sortable: true,
      sortValue: (l) => l.timestamp || '',
    },
  ];

  return (
    <DataTable
      data={logs}
      columns={columns}
      keyExtractor={(l) => `${l.id || l.timestamp}-${l.lockerNumber}`}
      searchPlaceholder="Search locker audit logs..."
      searchFilter={(l, q) =>
        l.lockerNumber.toLowerCase().includes(q.toLowerCase()) ||
        l.memberName.toLowerCase().includes(q.toLowerCase()) ||
        l.eventDescription.toLowerCase().includes(q.toLowerCase())
      }
      emptyMessage="No locker audit events recorded."
    />
  );
}
