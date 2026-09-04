'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (item: T) => string | number;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  emptyMessage?: string;
  compact?: boolean;
  className?: string;
  actions?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = 'Search records...',
  searchFilter,
  emptyMessage = 'No matching records found.',
  compact = true,
  className,
  actions,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredData = useMemo(() => {
    let result = data;
    if (searchQuery.trim() && searchFilter) {
      result = result.filter((item) => searchFilter(item, searchQuery.trim()));
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col && col.sortValue) {
        result = [...result].sort((a, b) => {
          const valA = col.sortValue!(a);
          const valB = col.sortValue!(b);
          if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
          if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }
    return result;
  }, [data, searchQuery, searchFilter, sortKey, sortDirection, columns]);

  const handleSort = (colKey: string) => {
    if (sortKey === colKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(colKey);
      setSortDirection('asc');
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {searchFilter ? (
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs font-mono text-foreground placeholder:text-muted-foreground/60 rounded-lg pl-8 pr-3 py-1.5 outline-none"
            />
          </div>
        ) : (
          <div />
        )}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Table container */}
      <div className="bg-[#0B132B]/80 border border-border/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-[#070D1E]/80 text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={cn(
                      compact ? 'px-3 py-2' : 'px-4 py-3',
                      col.sortable && 'cursor-pointer hover:text-foreground select-none',
                      col.className
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.header}</span>
                      {col.sortable && sortKey === col.key && (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="w-3 h-3 text-[#D4FF00]" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-[#D4FF00]" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs font-mono">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Layers className="w-5 h-5 text-muted-foreground/50" />
                      <span>{emptyMessage}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={keyExtractor(item)}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(compact ? 'px-3 py-2' : 'px-4 py-3', col.className)}
                      >
                        {col.accessor(item)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
