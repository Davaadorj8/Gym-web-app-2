'use client';

import React from 'react';
import { UserCheck, LogOut } from 'lucide-react';
import { LockerLog } from '@/lib/types';
import { DataTable, Column } from '../DataTable';

interface CheckInLogsTableProps {
  logs: LockerLog[];
}

export function CheckInLogsTable({ logs }: CheckInLogsTableProps) {
  const columns: Column<LockerLog>[] = [
    {
      key: 'memberName',
      header: 'Member Name',
      accessor: (log) => <span className="font-bold text-foreground font-sans">{log.memberName}</span>,
      sortable: true,
      sortValue: (l) => l.memberName,
    },
    {
      key: 'type',
      header: 'Action Event',
      accessor: (log) => (
        <span
          className={`font-bold px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 w-fit ${
            log.eventType === 'Checked In'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}
        >
          {log.eventType === 'Checked In' ? <UserCheck className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
          <span>{log.eventType}</span>
        </span>
      ),
      sortable: true,
      sortValue: (l) => l.eventType,
    },
    {
      key: 'assignedLocker',
      header: 'Locker Assigned',
      accessor: (log) => (
        <span className="font-mono text-muted-foreground text-[11px]">
          {log.lockerNumber ? `#${log.lockerNumber}` : '—'}
        </span>
      ),
      sortable: true,
      sortValue: (l) => l.lockerNumber || '',
    },
    {
      key: 'staffLogged',
      header: 'Processed By',
      accessor: (log) => <span className="text-muted-foreground text-[11px] font-mono">{log.staffLogged || 'System'}</span>,
      sortable: true,
      sortValue: (l) => l.staffLogged || '',
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      accessor: (log) => (
        <span className="text-[10px] text-muted-foreground font-mono">
          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
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
      keyExtractor={(l) => `${l.id || l.timestamp}-${l.memberName}`}
      searchPlaceholder="Search check-in logs..."
      searchFilter={(l, q) =>
        Boolean(
          l.memberName.toLowerCase().includes(q.toLowerCase()) ||
          (l.lockerNumber && l.lockerNumber.toString().includes(q))
        )
      }
      emptyMessage="No recent check-in logs recorded today."
    />
  );
}
