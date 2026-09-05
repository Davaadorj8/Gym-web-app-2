'use client';

import React, { useState } from 'react';
import { ShoppingCart, Check, X } from 'lucide-react';
import { NutrientProduct } from '@/features/inventory';
import { formatCurrency } from '@/lib/utils';

interface NutrientSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: NutrientProduct | null;
  onConfirmSale: (data: {
    product: NutrientProduct;
    quantity: number;
    paymentMethod: string;
    memberName: string;
  }) => void;
}

export function NutrientSaleModal({
  isOpen,
  onClose,
  product,
  onConfirmSale,
}: NutrientSaleModalProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('QPay');
  const [memberName, setMemberName] = useState<string>('');

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 || quantity > product.stock) return;

    onConfirmSale({
      product,
      quantity,
      paymentMethod,
      memberName: memberName.trim() || 'Walk-in Customer',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0B132B] border border-border rounded-xl w-full max-w-md p-4 sm:p-5 space-y-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#D4FF00]" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Record Nutrient Sale</h3>
              <p className="text-[10px] text-muted-foreground font-mono">{product.name}</p>
            </div>
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
          <div className="bg-[#070D1E] border border-border/60 rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Current Listed Price:</span>
              <strong className="text-[#D4FF00] font-bold">{formatCurrency(product.price)}</strong>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Available Stock:</span>
              <strong className="text-foreground font-bold">{product.stock} units</strong>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Sale Quantity *
            </label>
            <input
              type="number"
              min="1"
              max={product.stock}
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-3 py-2 outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-3 py-2 outline-none cursor-pointer font-mono"
            >
              <option value="QPay">QPay Instant Digital</option>
              <option value="Card">Credit / Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Wire Transfer</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Member / Buyer Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Walk-in Customer or Member Name"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-3 py-2 outline-none font-sans"
            />
          </div>

          <div className="bg-[#111C38]/60 border border-blue-500/30 rounded-lg p-2.5 space-y-0.5 text-[10px] text-slate-300">
            <div className="flex justify-between font-bold text-foreground text-xs">
              <span>Total Sale Amount:</span>
              <span className="text-[#D4FF00]">{formatCurrency(product.price * quantity)}</span>
            </div>
            <p className="text-[9px] text-muted-foreground">
              * Unit price locked at {formatCurrency(product.price)} in financial revenue records.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/80">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#D4FF00] hover:bg-[#c3eb00] text-black font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-md transition-all flex items-center gap-1.5 font-mono"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Sale</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
