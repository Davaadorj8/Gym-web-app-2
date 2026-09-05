'use client';

import React from 'react';
import { ShoppingCart, Edit2, Trash2, Check, X, Calendar, Award } from 'lucide-react';
import { NutrientProduct, getNutrientExpiryStatus } from '@/features/inventory';
import { cn, formatCurrency } from '@/lib/utils';
import { useDashboard } from '@/lib/orchestration';

interface InventoryTableProps {
  nutrients: NutrientProduct[];
  selectedNutrientIds: string[];
  setSelectedNutrientIds: (ids: string[]) => void;
  handleDeleteNutrient: (id: string) => void;
  editingNutrientId: string | null;
  setEditingNutrientId: (id: string | null) => void;
  editingPriceValue: string;
  setEditingPriceValue: (val: string) => void;
  handleSavePriceUpdate: (id: string) => void;
  handleStartEditingPrice: (item: NutrientProduct) => void;
  handleOpenSaleModal: (item: NutrientProduct) => void;
}

export function InventoryTable({
  nutrients,
  selectedNutrientIds,
  setSelectedNutrientIds,
  handleDeleteNutrient,
  editingNutrientId,
  setEditingNutrientId,
  editingPriceValue,
  setEditingPriceValue,
  handleSavePriceUpdate,
  handleStartEditingPrice,
  handleOpenSaleModal,
}: InventoryTableProps) {
  const dashboard = useDashboard();

  if (nutrients.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-xs font-mono">
        No nutrients found matching your criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {nutrients.map((item) => {
        const isEditingPrice = editingNutrientId === item.id;
        const isSelected = selectedNutrientIds.includes(item.id);
        const expStatus = getNutrientExpiryStatus(item.bestBeforeDate);

        // Derive historical sales info for this product
        const itemSales = dashboard.nutrientSales.filter((s) => s.productId === item.id);
        const unitsSold = itemSales.reduce((acc, s) => acc + s.quantity, 0);
        const totalSalesRevenue = itemSales.reduce((acc, s) => acc + s.totalPrice, 0);

        return (
          <div
            key={item.id}
            onClick={() => {
              if (selectedNutrientIds.includes(item.id)) {
                setSelectedNutrientIds(selectedNutrientIds.filter((id) => id !== item.id));
              } else {
                setSelectedNutrientIds([...selectedNutrientIds, item.id]);
              }
            }}
            className={cn(
              'bg-[#0B132B]/80 dark:bg-[#0D1527] border rounded-xl p-3.5 flex flex-col justify-between gap-3 transition-all cursor-pointer group shadow-sm',
              isSelected
                ? 'border-[#D4FF00] ring-1 ring-[#D4FF00]'
                : 'border-border/60 hover:border-[#D4FF00]/40'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                  isSelected
                    ? 'bg-[#D4FF00]/10 border-[#D4FF00]/40 text-[#D4FF00]'
                    : 'bg-[#111C38] border-slate-800/80 text-muted-foreground group-hover:text-foreground'
                )}
              >
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-muted-foreground">
                    {item.category}
                  </span>
                  {expStatus === 'expired' && (
                    <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase">
                      Expired
                    </span>
                  )}
                  {expStatus === 'expiring_soon' && (
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase">
                      Expiring Soon
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-foreground mt-0.5">
                  {item.name}
                </h4>
                {item.flavor && (
                  <p className="text-[11px] text-muted-foreground font-mono italic">
                    Flavor: {item.flavor}
                  </p>
                )}
                {item.bestBeforeDate && (
                  <p
                    className={cn(
                      'text-[11px] font-mono mt-1 flex items-center gap-1',
                      expStatus === 'expired'
                        ? 'text-rose-400 font-bold'
                        : expStatus === 'expiring_soon'
                        ? 'text-amber-400 font-bold'
                        : 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span>Best before: {item.bestBeforeDate}</span>
                  </p>
                )}
                {/* Historical Sales Summary Badge */}
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-muted/30 border border-border/60 rounded px-2 py-0.5 text-slate-300">
                    <Award className="w-3 h-3 text-[#D4FF00]" />
                    {unitsSold > 0
                      ? `${unitsSold} sold (${formatCurrency(totalSalesRevenue)} recorded)`
                      : 'No sales recorded yet'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNutrient(item.id);
                }}
                className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors cursor-pointer"
                title="Delete Product"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="pt-3 border-t border-border/60 space-y-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">
                  Stock:{' '}
                  <strong
                    className={cn(
                      item.stock === 0
                        ? 'text-rose-400 font-bold'
                        : item.stock <= 5
                        ? 'text-amber-400 font-bold'
                        : 'text-foreground'
                    )}
                  >
                    {item.stock} units
                  </strong>
                </span>
                {/* Price Editing vs Display */}
                {isEditingPrice ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editingPriceValue}
                      onChange={(e) => setEditingPriceValue(e.target.value)}
                      className="w-24 bg-[#0B132B] border border-[#D4FF00] text-[#D4FF00] font-mono text-xs px-2 py-1 rounded outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSavePriceUpdate(item.id)}
                      className="bg-[#D4FF00] text-black p-1 rounded hover:opacity-90 transition-opacity"
                      title="Save Price"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingNutrientId(null)}
                      className="bg-muted text-muted-foreground p-1 rounded hover:text-foreground"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="bg-muted/40 border border-border/60 rounded px-2 py-0.5 text-[#D4FF00] font-bold font-mono flex items-center gap-1">
                      <span>{formatCurrency(item.price)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartEditingPrice(item)}
                      className="text-muted-foreground hover:text-[#D4FF00] p-1 rounded transition-colors cursor-pointer"
                      title="Change Price (Admin)"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              {/* Quick Actions Row */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenSaleModal(item)}
                  disabled={item.stock <= 0}
                  className={cn(
                    'w-full py-1.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer',
                    item.stock > 0
                      ? 'bg-[#D4FF00]/10 hover:bg-[#D4FF00]/20 text-[#D4FF00] border border-[#D4FF00]/30'
                      : 'bg-muted/40 text-muted-foreground border border-border/40 opacity-50 cursor-not-allowed'
                  )}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Record Sale</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
