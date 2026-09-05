'use client';

import React, { useState, useEffect } from 'react';
import { Package, Check, X } from 'lucide-react';
import { NutrientProduct, Supplier } from '@/features/inventory';
import { formatCurrency } from '@/lib/utils';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  nutrients: NutrientProduct[];
  selectedNutrientIds: string[];
  onConfirmPO: (poData: {
    supplierId: string;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      unitPurchaseCost: number;
    }[];
  }) => void;
}

export function PurchaseOrderModal({
  isOpen,
  onClose,
  suppliers,
  nutrients,
  selectedNutrientIds,
  onConfirmPO,
}: PurchaseOrderModalProps) {
  const [poSupplierId, setPoSupplierId] = useState<string>('');
  const [poItemsMap, setPoItemsMap] = useState<
    Record<string, { quantity: number; unitPurchaseCost: number }>
  >({});
  const [wasOpen, setWasOpen] = useState(false);

  if (isOpen && !wasOpen) {
    setWasOpen(true);
    if (suppliers.length > 0) {
      setPoSupplierId(suppliers[0].id);
    }
    const initialMap: Record<string, { quantity: number; unitPurchaseCost: number }> = {};
    selectedNutrientIds.forEach((id) => {
      const item = nutrients.find((n) => n.id === id);
      if (item) {
        initialMap[id] = {
          quantity: 20,
          unitPurchaseCost: Math.round(item.price * 0.5),
        };
      }
    });
    setPoItemsMap(initialMap);
  } else if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierId) return;

    const items = selectedNutrientIds.map((id) => {
      const item = nutrients.find((n) => n.id === id);
      const values = poItemsMap[id] || { quantity: 10, unitPurchaseCost: 0 };
      return {
        productId: id,
        productName: item?.name || 'Unknown',
        quantity: values.quantity,
        unitPurchaseCost: values.unitPurchaseCost,
      };
    });

    onConfirmPO({ supplierId: poSupplierId, items });
    onClose();
  };

  const totalCost = selectedNutrientIds.reduce((acc, id) => {
    const values = poItemsMap[id] || { quantity: 20, unitPurchaseCost: 0 };
    return acc + values.quantity * values.unitPurchaseCost;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0B132B] border border-border rounded-xl w-full max-w-lg p-4 sm:p-5 space-y-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 font-sans">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#D4FF00]" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide font-mono">
              Restock &amp; Purchase Intake
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 font-mono text-xs">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Select Registered Supplier
            </label>
            <select
              value={poSupplierId}
              onChange={(e) => setPoSupplierId(e.target.value)}
              className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-2.5 py-2 outline-none font-sans"
              required
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name} ({sup.leadTimeDays}d lead)
                </option>
              ))}
            </select>
            {suppliers.length === 0 && (
              <p className="text-[10px] text-rose-400">
                * No registered suppliers. Go to &apos;Suppliers &amp; PO&apos; sub-tab to register one first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Order Items &amp; Unit Costs
            </span>

            <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
              {selectedNutrientIds.map((id) => {
                const item = nutrients.find((n) => n.id === id);
                if (!item) return null;
                const values = poItemsMap[id] || { quantity: 20, unitPurchaseCost: 0 };
                return (
                  <div key={id} className="p-2.5 bg-[#070D1E] border border-border/60 rounded-lg space-y-1.5">
                    <div className="font-sans font-bold text-foreground text-xs">{item.name}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[9px] text-muted-foreground uppercase">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={values.quantity}
                          onChange={(e) => {
                            const val = Math.max(1, Number(e.target.value) || 1);
                            setPoItemsMap({
                              ...poItemsMap,
                              [id]: { ...values, quantity: val },
                            });
                          }}
                          className="w-full bg-[#0B132B] border border-border/60 focus:border-[#D4FF00] text-xs text-foreground rounded px-2 py-1 outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[9px] text-muted-foreground uppercase">
                          Unit Purchase Cost (₮)
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={values.unitPurchaseCost}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            setPoItemsMap({
                              ...poItemsMap,
                              [id]: { ...values, unitPurchaseCost: val },
                            });
                          }}
                          className="w-full bg-[#0B132B] border border-border/60 focus:border-[#D4FF00] text-xs text-foreground rounded px-2 py-1 outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#111C38]/60 border border-blue-500/30 rounded-lg p-2.5 flex justify-between items-center text-xs font-bold text-foreground">
            <span>Total Estimated Cost:</span>
            <span className="text-[#D4FF00] font-mono">{formatCurrency(totalCost)}</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/80">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={suppliers.length === 0}
              className="bg-[#D4FF00] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#c3eb00] text-black font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-md transition-all flex items-center gap-1.5 font-mono"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Submit PO</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
