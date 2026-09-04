'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-[#0B132B]/80 border-border/80 text-foreground',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    danger: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    info: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
  };

  const iconBgStyles = {
    default: 'bg-[#111C38] text-[#D4FF00] border-border/60',
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    danger: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    info: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  };

  return (
    <div
      className={cn(
        'border rounded-xl p-3.5 flex flex-col justify-between gap-2 shadow-sm transition-all',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-muted-foreground">
          {title}
        </span>
        {Icon && (
          <div className={cn('p-1.5 rounded-lg border shrink-0', iconBgStyles[variant])}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-lg font-bold font-mono tracking-tight text-foreground">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded',
              trend.isPositive
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            )}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[10px] text-muted-foreground font-mono truncate">{subtitle}</p>
      )}
    </div>
  );
}
