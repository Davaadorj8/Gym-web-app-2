'use client';

import React from 'react';
import { DollarSign, ArrowUpRight, Target, Sparkles } from 'lucide-react';
import { StatCard } from '../StatCard';
import { formatCurrency } from '@/lib/utils';
import { GymMember, BuiltPlan } from '@/lib/types';
import { aggregateExtensionMetrics, calculateTotalMembershipValue, findPlanForMember } from '@/lib/services';

interface FinancialTabProps {
  members: GymMember[];
  plans: BuiltPlan[];
  nutrientSalesTotal: number;
}

export function FinancialTab({ members, plans, nutrientSalesTotal }: FinancialTabProps) {
  const extensionMetrics = aggregateExtensionMetrics(members);
  const activeValuation = calculateTotalMembershipValue(members, plans);

  // Active membership plan fees collected (estimated)
  const membershipFeesTotal = members.reduce((acc, m) => {
    const plan = findPlanForMember(m, plans);
    return acc + (plan?.price || 0);
  }, 0);

  const grossRevenue = membershipFeesTotal + extensionMetrics.totalRevenue + nutrientSalesTotal;

  return (
    <div className="space-y-4 font-sans animate-in fade-in duration-150">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Gross Revenue"
          value={formatCurrency(grossRevenue)}
          subtitle="Includes Memberships, Extensions & Nutrients"
          icon={DollarSign}
          variant="success"
          trend={{ value: '+14.2%', isPositive: true }}
        />
        <StatCard
          title="Membership Subscriptions"
          value={formatCurrency(membershipFeesTotal)}
          subtitle={`${members.length} active member profiles`}
          icon={ArrowUpRight}
          variant="default"
        />
        <StatCard
          title="Extension Fees Collected"
          value={formatCurrency(extensionMetrics.totalRevenue)}
          subtitle={`${extensionMetrics.totalTransactions} renewal transactions`}
          icon={Target}
          variant="info"
        />
        <StatCard
          title="Nutrient POS Sales"
          value={formatCurrency(nutrientSalesTotal)}
          subtitle="Supplement & Beverage revenue"
          icon={Sparkles}
          variant="warning"
        />
      </div>

      {/* Revenue Breakdown Summary Box */}
      <div className="bg-[#0B132B]/80 border border-border/80 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
            Financial Stream Summary
          </h3>
          <span className="text-[10px] font-mono text-muted-foreground">
            Checked-in Active Valuation: {formatCurrency(activeValuation)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 bg-[#070D1E] border border-border/60 rounded-lg space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase">Base Membership Plans</span>
            <div className="text-sm font-bold text-foreground">{formatCurrency(membershipFeesTotal)}</div>
            <p className="text-[9px] text-muted-foreground">
              {grossRevenue > 0 ? Math.round((membershipFeesTotal / grossRevenue) * 100) : 0}% of gross revenue
            </p>
          </div>

          <div className="p-3 bg-[#070D1E] border border-border/60 rounded-lg space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase">Plan Extensions</span>
            <div className="text-sm font-bold text-emerald-400">{formatCurrency(extensionMetrics.totalRevenue)}</div>
            <p className="text-[9px] text-muted-foreground">
              {grossRevenue > 0 ? Math.round((extensionMetrics.totalRevenue / grossRevenue) * 100) : 0}% of gross revenue
            </p>
          </div>

          <div className="p-3 bg-[#070D1E] border border-border/60 rounded-lg space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase">Nutrient POS Sales</span>
            <div className="text-sm font-bold text-amber-400">{formatCurrency(nutrientSalesTotal)}</div>
            <p className="text-[9px] text-muted-foreground">
              {grossRevenue > 0 ? Math.round((nutrientSalesTotal / grossRevenue) * 100) : 0}% of gross revenue
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
