
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input, Badge } from '@/components/ui';
import { 
  Building2, Plus, Phone, FileText, ShoppingCart, 
  MapPin, Check, Truck, X, Package, Clock, ChevronDown, Layers, ChevronUp, UserCheck
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useDashboard } from '@/lib/orchestration';
import { Supplier, PurchaseOrder } from '@/features/inventory';

interface SuppliersAndPOTabProps {
  showToast: (msg: string) => void;
}

export function SuppliersAndPOTab({ showToast }: SuppliersAndPOTabProps) {
  const t = useTranslations('Inventory');
  const dashboard = useDashboard();
  
  const suppliers = dashboard.suppliers || [];
  const purchaseOrders = dashboard.purchaseOrders || [];
  
  const [newSupplierForm, setNewSupplierForm] = useState({
    name: '',
    phone: '',
    contactEmail: '',
    leadTimeDays: 7,
  });

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierForm.name.trim() || !newSupplierForm.phone.trim()) return;

    const uniqueId = typeof window !== 'undefined' && window.crypto ? window.crypto.randomUUID() : Date.now().toString();
    dashboard.addSupplier({
      id: `supp-${uniqueId}`,
      name: newSupplierForm.name,
      phone: newSupplierForm.phone,
      contactEmail: newSupplierForm.contactEmail,
      leadTimeDays: newSupplierForm.leadTimeDays,
    });
    
    showToast('New nutrient supplier registered.');
    setNewSupplierForm({ name: '', phone: '', contactEmail: '', leadTimeDays: 7 });
  };

  const [expandedPoId, setExpandedPoId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'ordered': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'received': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 4. SUPPLIERS & PURCHASE ORDERS TAB */}
      
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Suppliers & Registration */}
            <div className="lg:col-span-4 space-y-4">
              {/* Add Supplier Form */}
              <div className="bg-[#0B132B]/80 dark:bg-[#0D1527] border border-border/80 rounded-xl p-3.5 space-y-3.5 shadow-xl">
                <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                  <Building2 className="w-4 h-4 text-[#D4FF00]" />
                  <h3 className="text-xs sm:text-sm font-bold font-mono uppercase text-foreground">
                    Register Supplier
                  </h3>
                </div>

                <form onSubmit={handleAddSupplier} className="space-y-3 font-mono text-xs">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Supplier Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elite Sports Nutrition"
                      value={newSupplierForm.name}
                      onChange={(e) => setNewSupplierForm({ ...newSupplierForm, name: e.target.value })}
                      className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-3 py-2 outline-none font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      placeholder="orders@supplier.com"
                      value={newSupplierForm.contactEmail}
                      onChange={(e) => setNewSupplierForm({ ...newSupplierForm, contactEmail: e.target.value })}
                      className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-3 py-2 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="9911-2233"
                      value={newSupplierForm.phone}
                      onChange={(e) => setNewSupplierForm({ ...newSupplierForm, phone: e.target.value })}
                      className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-3 py-2 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Lead Time (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newSupplierForm.leadTimeDays}
                      onChange={(e) => setNewSupplierForm({ ...newSupplierForm, leadTimeDays: Number(e.target.value) })}
                      className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-lg px-3 py-2 outline-none"
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full text-xs py-2">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Register Supplier
                  </Button>
                </form>
              </div>

              {/* Suppliers Directory */}
              <div className="bg-[#0B132B]/80 dark:bg-[#0D1527] border border-border/80 rounded-xl p-3.5 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <span className="text-xs sm:text-sm font-bold font-mono uppercase text-foreground">
                    Suppliers Directory
                  </span>
                  <Badge variant="outline">{dashboard.suppliers.length}</Badge>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {dashboard.suppliers.map((sup) => (
                    <div key={sup.id} className="p-2.5 bg-[#070D1E] border border-border/60 rounded-lg space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-foreground font-black">{sup.name}</strong>
                        <Badge variant="outline" className="text-[10px] scale-90 font-mono">
                          {sup.leadTimeDays}d lead
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono space-y-0.5">
                        <p>{sup.contactEmail}</p>
                        <p>{sup.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Purchase Orders list */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-[#0B132B]/80 dark:bg-[#0D1527] border border-border/80 rounded-xl p-4 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#D4FF00]" />
                    <h2 className="text-sm font-bold text-foreground font-mono uppercase">
                      Purchase Order Pipeline
                    </h2>
                  </div>
                  <Badge variant="info">{dashboard.purchaseOrders.length} Orders</Badge>
                </div>

                <div className="space-y-4">
                  {dashboard.purchaseOrders.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center py-12 font-mono">
                      No purchase orders recorded yet. Use the Nutrients tab to restock via POs.
                    </p>
                  ) : (
                    [...dashboard.purchaseOrders].reverse().map((po) => (
                      <div
                        key={po.id}
                        className="p-4 bg-[#070D1E] border border-border/80 rounded-xl space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#D4FF00]">#{po.id}</span>
                            <span className="text-xs text-muted-foreground font-mono">|</span>
                            <span className="text-xs text-foreground font-black font-sans">{po.supplierName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(po.createdAt).toLocaleDateString()}
                            </span>
                            <Badge
                              variant={
                                po.status === 'RECEIVED'
                                  ? 'success'
                                  : po.status === 'CANCELLED'
                                  ? 'destructive'
                                  : 'warning'
                              }
                              className="text-[10px] font-mono font-bold"
                            >
                              {po.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Items listed */}
                        <div className="space-y-1.5 pl-2 border-l-2 border-[#D4FF00]/40">
                          {po.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-xs font-mono text-slate-300">
                              <span>
                                {item.productName} <strong className="text-foreground">x{item.quantity}</strong>
                              </span>
                              <span>{formatCurrency(item.unitPurchaseCost)} / unit</span>
                            </div>
                          ))}
                        </div>

                        {/* Cost & Action footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 font-mono text-xs">
                          <div>
                            <span className="text-muted-foreground mr-1.5">Total Cost:</span>
                            <strong className="text-foreground font-extrabold">{formatCurrency(po.totalCost)}</strong>
                          </div>

                          {po.status === 'ORDERED' && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  dashboard.cancelPurchaseOrder(po.id);
                                  showToast(`Purchase Order ${po.id} cancelled.`);
                                }}
                                className="h-8 text-[11px] font-bold border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                              >
                                Cancel Order
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => {
                                  dashboard.receivePurchaseOrder(po.id);
                                  showToast(`PO ${po.id} received. Restocked items.`);
                                }}
                                className="h-8 text-[11px]"
                              >
                                Mark Received
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section: Stock Intake History Logs */}
          <div className="bg-[#0B132B]/80 dark:bg-[#0D1527] border border-border/80 rounded-xl p-4 space-y-3.5 shadow-xl">
            <div className="flex items-center gap-2 border-b border-border/80 pb-2.5">
              <Layers className="w-4 h-4 text-[#D4FF00]" />
              <h3 className="text-sm font-bold text-foreground font-mono uppercase">
                Stock Intake Logs &amp; Gross Margins
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground font-bold">
                    <th className="py-2.5">Intake Timestamp</th>
                    <th className="py-2.5">PO Ref</th>
                    <th className="py-2.5">Product Name</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Cost Price</th>
                    <th className="py-2.5 text-right">Sell Price</th>
                    <th className="py-2.5 text-right text-[#D4FF00]">Gross Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-slate-300">
                  {dashboard.stockIntakes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center italic text-muted-foreground">
                        No intake logs recorded yet. Receiving purchase orders creates logs here.
                      </td>
                    </tr>
                  ) : (
                    [...dashboard.stockIntakes].reverse().map((log) => {
                      const profit = log.unitSellingPrice - log.unitPurchaseCost;
                      const margin = log.unitSellingPrice > 0 ? (profit / log.unitSellingPrice) * 100 : 0;
                      return (
                        <tr key={log.id} className="hover:bg-muted/10">
                          <td className="py-2.5">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="py-2.5 text-[#D4FF00]">#{log.purchaseOrderId}</td>
                          <td className="py-2.5 text-foreground font-sans font-bold">{log.productName}</td>
                          <td className="py-2.5 text-center">{log.quantity}</td>
                          <td className="py-2.5 text-right">{formatCurrency(log.unitPurchaseCost)}</td>
                          <td className="py-2.5 text-right">{formatCurrency(log.unitSellingPrice)}</td>
                          <td className={`py-2.5 text-right font-black ${margin >= 40 ? 'text-[#D4FF00]' : 'text-amber-400'}`}>
                            {margin.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      
    </div>
  );
}
