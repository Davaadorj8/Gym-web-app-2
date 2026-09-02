'use client';

import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface InventoryStatsCardsProps {
  outOfStockCount: number;
  lowStockCount: number;
}

export function InventoryStatsCards({ outOfStockCount, lowStockCount }: InventoryStatsCardsProps) {
  if (outOfStockCount === 0 && lowStockCount === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {outOfStockCount > 0 && (
        <div className="bg-rose-500/10 border-2 border-rose-500/30 text-rose-400 p-4 rounded-xl flex items-start gap-3 shadow-md">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider font-mono">Critical: Out of Stock Alert!</h4>
            <p className="text-[11px] text-muted-foreground font-mono">
              There are <strong className="text-rose-400 font-extrabold">{outOfStockCount}</strong> products completely depleted. Members cannot purchase these. Restock immediately.
            </p>
          </div>
        </div>
      )}
      {lowStockCount > 0 && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 p-4 rounded-xl flex items-start gap-3 shadow-md">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider font-mono">Warning: Low Stock Alert!</h4>
            <p className="text-[11px] text-muted-foreground font-mono">
              There are <strong className="text-amber-400 font-extrabold">{lowStockCount}</strong> products with less than 5 units remaining. Order refills soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
