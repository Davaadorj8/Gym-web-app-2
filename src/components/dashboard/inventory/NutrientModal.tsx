'use client';

import React, { useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { NutrientProduct } from '@/features/inventory';

interface NutrientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNutrient: (product: NutrientProduct) => void;
}

export function NutrientModal({ isOpen, onClose, onAddNutrient }: NutrientModalProps) {
  const [nutrientForm, setNutrientForm] = useState<{
    name: string;
    category: NutrientProduct['category'];
    price: number;
    stock: number;
    flavor: string;
    bestBeforeDate: string;
  }>({
    name: '',
    category: 'Supplements',
    price: 0,
    stock: 0,
    flavor: '',
    bestBeforeDate: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nutrientForm.name.trim()) return;

    const uniqueNutrId =
      typeof window !== 'undefined' && window.crypto ? window.crypto.randomUUID() : 'nutr-new';

    const newProduct: NutrientProduct = {
      id: `nutr-${uniqueNutrId}`,
      name: nutrientForm.name.trim(),
      category: nutrientForm.category,
      price: Math.max(0, Number(nutrientForm.price) || 0),
      stock: Math.max(0, Number(nutrientForm.stock) || 0),
      flavor: nutrientForm.flavor.trim() || undefined,
      bestBeforeDate: nutrientForm.bestBeforeDate ? nutrientForm.bestBeforeDate : undefined,
    };

    onAddNutrient(newProduct);
    onClose();
    setNutrientForm({
      name: '',
      category: 'Supplements',
      price: 0,
      stock: 0,
      flavor: '',
      bestBeforeDate: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0B132B] border border-border rounded-xl w-full max-w-md p-4 sm:p-5 space-y-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#D4FF00]" />
            <h3 className="text-sm font-bold text-foreground">Add Nutrient Product</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Whey Isolate Protein Shake"
              value={nutrientForm.name}
              onChange={(e) => setNutrientForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-3 py-2 outline-none font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
                Category
              </label>
              <select
                value={nutrientForm.category}
                onChange={(e) =>
                  setNutrientForm((f) => ({
                    ...f,
                    category: e.target.value as NutrientProduct['category'],
                  }))
                }
                className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-2.5 py-2 outline-none font-mono"
              >
                <option value="Supplements">Supplements</option>
                <option value="Shakes">Shakes</option>
                <option value="Beverages">Beverages</option>
                <option value="Snacks">Snacks</option>
                <option value="Vitamins">Vitamins</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
                Flavor / Specs
              </label>
              <input
                type="text"
                placeholder="e.g. Vanilla / 500ml"
                value={nutrientForm.flavor}
                onChange={(e) => setNutrientForm((f) => ({ ...f, flavor: e.target.value }))}
                className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-2.5 py-2 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
                Unit Price (₮ MNT)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs">
                  ₮
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  value={nutrientForm.price}
                  onChange={(e) =>
                    setNutrientForm((f) => ({ ...f, price: Number(e.target.value) }))
                  }
                  className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs font-mono text-foreground rounded-lg pl-6 pr-2.5 py-2 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
                Initial Stock Count
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={nutrientForm.stock}
                onChange={(e) =>
                  setNutrientForm((f) => ({ ...f, stock: Number(e.target.value) }))
                }
                className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs font-mono text-foreground rounded-lg px-2.5 py-2 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
              Best Before Date (Expiry)
            </label>
            <input
              type="date"
              value={nutrientForm.bestBeforeDate}
              onChange={(e) => setNutrientForm((f) => ({ ...f, bestBeforeDate: e.target.value }))}
              className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-2.5 py-2 outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/80">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#D4FF00] hover:bg-[#c3eb00] text-black font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-md transition-all font-mono"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
