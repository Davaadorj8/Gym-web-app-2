'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string | null;
  className?: string;
  id?: string;
}

export function Toast({
  type = 'success',
  message,
  className,
  id = 'toast-notification',
}: ToastProps) {
  if (!message) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-destructive shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
  };

  const styleMap = {
    success: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
    error: 'bg-destructive/20 border-destructive/40 text-destructive-foreground',
    warning: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
    info: 'bg-sky-950/80 border-sky-500/40 text-sky-300',
  };

  return (
    <div
      id={id}
      className={cn(
        'fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-xs font-mono animate-in slide-in-from-bottom-4 duration-200',
        styleMap[type],
        className
      )}
    >
      {iconMap[type]}
      <span className="font-medium">{message}</span>
    </div>
  );
}
