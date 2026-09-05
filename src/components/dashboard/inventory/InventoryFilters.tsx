'use client';

import React from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui';

interface InventoryFiltersProps {
  nutrientSearchQuery: string;
  setNutrientSearchQuery: (query: string) => void;
  nutrientFilterStock: 'all' | 'low' | 'out';
  setNutrientFilterStock: (filter: 'all' | 'low' | 'out') => void;
  lowStockCount: number;
  outOfStockCount: number;
  selectedCount: number;
  onOpenPOModal: () => void;
}

export function InventoryFilters({
  nutrientSearchQuery,
  setNutrientSearchQuery,
  nutrientFilterStock,
  setNutrientFilterStock,
  lowStockCount,
  outOfStockCount,
  selectedCount,
  onOpenPOModal
}: InventoryFiltersProps) {
  return (
    <div className="bg-[#070D1E]/60 border border-border/80 rounded-xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Box */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search supplements / flavor / category..."
            value={nutrientSearchQuery}
            onChange={(e) => setNutrientSearchQuery(e.target.value)}
            className="bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] focus:ring-1 focus:ring-[#D4FF00] text-xs font-mono text-foreground placeholder:text-muted-foreground/60 rounded-xl pl-9 pr-4 py-2.5 outline-none w-full sm:w-64 transition-all"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-muted/20 p-1 rounded-lg border border-border/60">
          <Button
            type="button"
            variant={nutrientFilterStock === 'all' ? 'primary' : 'outline'}
            onClick={() => setNutrientFilterStock('all')}
            className="h-8 text-xs px-3 py-1 font-mono"
          >
            All Items
          </Button>
          <Button
            type="button"
            variant={nutrientFilterStock === 'low' ? 'primary' : 'outline'}
            onClick={() => setNutrientFilterStock('low')}
            className="h-8 text-xs px-3 py-1 font-mono"
          >
            Low Stock ({lowStockCount})
          </Button>
          <Button
            type="button"
            variant={nutrientFilterStock === 'out' ? 'primary' : 'outline'}
            onClick={() => setNutrientFilterStock('out')}
            className="h-8 text-xs px-3 py-1 font-mono"
          >
            Out of Stock ({outOfStockCount})
          </Button>
        </div>
      </div>

      {/* Batch Actions */}
      <div className="flex items-center gap-3 border-t xl:border-t-0 xl:border-l border-border/60 pt-3 xl:pt-0 xl:pl-4">
        <span className="text-xs text-muted-foreground font-mono">
          {selectedCount} selected
        </span>
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={onOpenPOModal}
          className="bg-[#D4FF00] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#c3eb00] text-black font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-md transition-all flex items-center gap-1.5 font-mono"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Restock via PO</span>
        </button>
      </div>
    </div>
  );
}
