'use client';

import React from 'react';
import { Target, Layers } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BuiltPlan, GymMember } from '@/lib/types';
import { DataTable, Column } from '../DataTable';
import { formatCurrency } from '@/lib/utils';
import { PLAN_TIER_COLORS, calculateMembersByPlanTier } from './analytics.types';

interface PlansTabProps {
  plans: BuiltPlan[];
  members: GymMember[];
}

export function PlansTab({ plans, members }: PlansTabProps) {
  const tierData = calculateMembersByPlanTier(members, plans);

  const columns: Column<BuiltPlan>[] = [
    {
      key: 'title',
      header: 'Plan Title',
      accessor: (p) => <span className="font-bold text-foreground">{p.title}</span>,
      sortable: true,
      sortValue: (p) => p.title,
    },
    {
      key: 'categoryTarget',
      header: 'Target Segment',
      accessor: (p) => (
        <span className="text-muted-foreground uppercase text-[10px] font-mono px-2 py-0.5 bg-[#070D1E] border border-border/60 rounded">
          {p.categoryTarget}
        </span>
      ),
      sortable: true,
      sortValue: (p) => p.categoryTarget,
    },
    {
      key: 'price',
      header: 'Price (₮)',
      accessor: (p) => <span className="text-[#D4FF00] font-bold font-mono">{formatCurrency(p.price)}</span>,
      sortable: true,
      sortValue: (p) => p.price,
    },
    {
      key: 'activeMembers',
      header: 'Enrolled Members',
      accessor: (p) => {
        const count = members.filter((m) => m.planTitle === p.id).length;
        return <span className="font-mono font-bold text-foreground">{count} members</span>;
      },
      sortable: true,
      sortValue: (p) => members.filter((m) => m.planTitle === p.id).length,
    },
  ];

  return (
    <div className="space-y-4 font-sans animate-in fade-in duration-150">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tier Distribution Chart */}
        <div className="bg-[#0B132B]/80 border border-border/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 border-b border-border/80 pb-2.5">
            <Target className="w-4 h-4 text-[#D4FF00]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
              Plan Target Segment Distribution
            </h3>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {tierData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={PLAN_TIER_COLORS[idx % PLAN_TIER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#070D1E',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plans Table */}
        <div className="lg:col-span-2 bg-[#0B132B]/80 border border-border/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-border/80 pb-2.5">
            <Layers className="w-4 h-4 text-[#D4FF00]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
              Registered Membership Product Catalog
            </h3>
          </div>

          <DataTable
            data={plans}
            columns={columns}
            keyExtractor={(p) => p.id}
            searchPlaceholder="Search plans..."
            searchFilter={(p, q) =>
              p.title.toLowerCase().includes(q.toLowerCase()) ||
              p.categoryTarget.toLowerCase().includes(q.toLowerCase())
            }
            emptyMessage="No membership plans registered."
          />
        </div>
      </div>
    </div>
  );
}
