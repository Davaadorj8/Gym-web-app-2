'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Lock, ShoppingCart, Plus } from 'lucide-react';
import { BuiltPlan, AuthUser, NutrientProduct } from '@/lib/types';
import { Toast } from '@/components/ui';
import { useDashboard } from '@/lib/orchestration';
import { cn, formatCurrency } from '@/lib/utils';
import {
  InventoryStatsCards,
  InventoryFilters,
  InventoryTable,
  MembershipPlanBuilderTab,
  LockerManagementTab,
  SuppliersAndPOTab,
  NutrientModal,
  NutrientSaleModal,
  PurchaseOrderModal,
} from './inventory';

interface InventoryViewProps {
  plans?: BuiltPlan[];
  onAddPlan?: (plan: BuiltPlan) => void;
  onDeletePlan?: (id: string) => void;
  totalLockers?: number;
  onSaveTotalLockers?: (count: number) => void;
  currentUser?: AuthUser;
}

type ActiveInventoryTab = 'plan-builder' | 'locker-management' | 'nutrients' | 'purchase-orders';

export default function InventoryView({
  currentUser: propCurrentUser,
}: InventoryViewProps) {
  const dashboard = useDashboard();
  const currentUser = propCurrentUser ?? dashboard.currentUser;
  const isAdmin = !currentUser || currentUser.role === 'admin';
  const t = useTranslations('Inventory');

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<ActiveInventoryTab>('plan-builder');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Nutrients State & Filters
  const nutrients = dashboard.nutrients;
  const [nutrientSearchQuery, setNutrientSearchQuery] = useState('');
  const [nutrientFilterStock, setNutrientFilterStock] = useState<'all' | 'low' | 'out'>('all');
  const [selectedNutrientIds, setSelectedNutrientIds] = useState<string[]>([]);

  // Modals state
  const [isNutrientModalOpen, setIsNutrientModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [saleProduct, setSaleProduct] = useState<NutrientProduct | null>(null);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);

  // Price Editing State
  const [editingNutrientId, setEditingNutrientId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');

  const filteredNutrients = useMemo(() => {
    return nutrients.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(nutrientSearchQuery.toLowerCase()) ||
        (item.flavor && item.flavor.toLowerCase().includes(nutrientSearchQuery.toLowerCase())) ||
        item.category.toLowerCase().includes(nutrientSearchQuery.toLowerCase());

      if (nutrientFilterStock === 'low') {
        return matchesSearch && item.stock > 0 && item.stock <= 5;
      }
      if (nutrientFilterStock === 'out') {
        return matchesSearch && item.stock === 0;
      }
      return matchesSearch;
    });
  }, [nutrients, nutrientSearchQuery, nutrientFilterStock]);

  const lowStockCount = useMemo(() => {
    return nutrients.filter((item) => item.stock > 0 && item.stock <= 5).length;
  }, [nutrients]);

  const outOfStockCount = useMemo(() => {
    return nutrients.filter((item) => item.stock === 0).length;
  }, [nutrients]);

  // Handlers
  const handleAddNutrient = (newProduct: NutrientProduct) => {
    dashboard.addNutrient(newProduct);
    showToast('Nutrient product added to inventory');
  };

  const handleDeleteNutrient = (id: string) => {
    dashboard.deleteNutrient(id);
    showToast('Product removed from inventory');
  };

  const handleStartEditingPrice = (item: NutrientProduct) => {
    setEditingNutrientId(item.id);
    setEditingPriceValue(item.price.toString());
  };

  const handleSavePriceUpdate = (id: string) => {
    const parsedPrice = Math.max(0, Number(editingPriceValue) || 0);
    dashboard.updateNutrientPrice(id, parsedPrice);
    setEditingNutrientId(null);
    showToast('Updated product price. Past sales records retain their original sale prices.');
  };

  const handleOpenSaleModal = (product: NutrientProduct) => {
    if (product.stock <= 0) {
      showToast('Cannot sell product: Item is out of stock.');
      return;
    }
    setSaleProduct(product);
    setIsSaleModalOpen(true);
  };

  const handleConfirmSale = (saleData: {
    product: NutrientProduct;
    quantity: number;
    paymentMethod: string;
    memberName: string;
  }) => {
    const { product, quantity, paymentMethod, memberName } = saleData;
    const unitPrice = product.price;
    const totalPrice = unitPrice * quantity;

    dashboard.recordNutrientSale({
      productId: product.id,
      productName: product.name,
      category: product.category,
      quantity,
      unitPrice,
      totalPrice,
      paymentMethod,
      memberName,
      staffLogged: currentUser?.name || 'Staff',
    });

    setIsSaleModalOpen(false);
    setSaleProduct(null);
    showToast(
      `Logged sale of ${quantity}x ${product.name} at ${formatCurrency(unitPrice)} each (Total: ${formatCurrency(totalPrice)}).`
    );
  };

  const handleConfirmPO = async (poData: {
    supplierId: string;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      unitPurchaseCost: number;
    }[];
  }) => {
    const supplier = dashboard.suppliers.find((s) => s.id === poData.supplierId);
    if (!supplier) return;

    const createdPo = await dashboard.createPurchaseOrder({
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: poData.items,
    });

    setSelectedNutrientIds([]);
    if (createdPo) {
      showToast(`Purchase Order ${createdPo.id} successfully generated & ordered.`);
    } else {
      showToast('Failed to generate purchase order. Please try again.');
    }
  };

  if (!isAdmin) {
    return (
      <div id="inventory-access-denied" className="w-full py-12 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-foreground">{t('adminOnly') || 'Admin Access Only'}</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            {t('inventoryAdminRestricted') || 'Inventory and plan configuration are restricted to Admin accounts.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="inventory-view-root" className="w-full space-y-4">
      {/* Toast Notification */}
      <Toast id="inventory-toast" message={toastMessage} type="success" />

      {/* Navigation Sub-Tabs Bar */}
      <div className="space-y-3">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {t('title') || 'Inventory Management'}
        </h1>

        <div className="flex items-center gap-5 border-b border-border/80 text-xs font-mono font-bold tracking-wider overflow-x-auto select-none pt-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('plan-builder')}
            className={cn(
              'pb-2 px-0.5 border-b-2 transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'plan-builder'
                ? 'text-[#D4FF00] border-[#D4FF00]'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            {t('tabPlanBuilder') || 'MEMBERSHIP PLAN BUILDER'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('locker-management')}
            className={cn(
              'pb-2 px-0.5 border-b-2 transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'locker-management'
                ? 'text-[#D4FF00] border-[#D4FF00]'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            {t('tabLockerManagement') || 'LOCKER MANAGEMENT'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nutrients')}
            className={cn(
              'pb-2 px-0.5 border-b-2 transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'nutrients'
                ? 'text-[#D4FF00] border-[#D4FF00]'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            {t('tabNutrients') || 'NUTRIENTS'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('purchase-orders')}
            className={cn(
              'pb-2 px-0.5 border-b-2 transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'purchase-orders'
                ? 'text-[#D4FF00] border-[#D4FF00]'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            {t('tabPurchaseOrders') || 'SUPPLIERS & PO'}
          </button>
        </div>
      </div>

      {/* Sub-Tab Views */}
      {activeTab === 'plan-builder' && <MembershipPlanBuilderTab showToast={showToast} />}
      {activeTab === 'locker-management' && <LockerManagementTab showToast={showToast} />}
      
      {activeTab === 'nutrients' && (
        <div className="space-y-4">
          <div
            id="card-nutrient-inventory"
            className="bg-[#0B132B]/80 dark:bg-[#0D1527] border border-border/80 rounded-xl p-5 shadow-lg"
          >
            {nutrients.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#111C38] border border-slate-800/80 flex items-center justify-center text-[#7E8CA3]">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-foreground">
                    {t('nutrientsTitle') || 'Nutrient Inventory'}
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {t('nutrientsSubtitle') ||
                      'Manage supplements, shakes, and other nutritional products available for members.'}
                  </p>
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsNutrientModalOpen(true)}
                    className="border border-[#D4FF00]/40 text-[#D4FF00] hover:bg-[#D4FF00]/10 px-5 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('addProductBtn') || 'Add New Product'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#070D1E] border border-border/80 flex items-center justify-center text-[#D4FF00]">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-foreground">
                        {t('nutrientsTitle') || 'Nutrient Inventory'}
                      </h2>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {nutrients.length} total nutritional items registered
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsNutrientModalOpen(true)}
                    className="border border-[#D4FF00]/40 text-[#D4FF00] hover:bg-[#D4FF00]/10 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('addProductBtn') || 'Add New Product'}</span>
                  </button>
                </div>

                <InventoryStatsCards outOfStockCount={outOfStockCount} lowStockCount={lowStockCount} />
                
                <InventoryFilters
                  nutrientSearchQuery={nutrientSearchQuery}
                  setNutrientSearchQuery={setNutrientSearchQuery}
                  nutrientFilterStock={nutrientFilterStock}
                  setNutrientFilterStock={setNutrientFilterStock}
                  lowStockCount={lowStockCount}
                  outOfStockCount={outOfStockCount}
                  selectedCount={selectedNutrientIds.length}
                  onOpenPOModal={() => setIsPOModalOpen(true)}
                />

                <InventoryTable
                  nutrients={filteredNutrients}
                  selectedNutrientIds={selectedNutrientIds}
                  setSelectedNutrientIds={setSelectedNutrientIds}
                  handleDeleteNutrient={handleDeleteNutrient}
                  editingNutrientId={editingNutrientId}
                  setEditingNutrientId={setEditingNutrientId}
                  editingPriceValue={editingPriceValue}
                  setEditingPriceValue={setEditingPriceValue}
                  handleSavePriceUpdate={handleSavePriceUpdate}
                  handleStartEditingPrice={handleStartEditingPrice}
                  handleOpenSaleModal={handleOpenSaleModal}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'purchase-orders' && <SuppliersAndPOTab showToast={showToast} />}

      {/* Modals */}
      <NutrientModal
        isOpen={isNutrientModalOpen}
        onClose={() => setIsNutrientModalOpen(false)}
        onAddNutrient={handleAddNutrient}
      />

      <NutrientSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false);
          setSaleProduct(null);
        }}
        product={saleProduct}
        onConfirmSale={handleConfirmSale}
      />

      <PurchaseOrderModal
        isOpen={isPOModalOpen}
        onClose={() => setIsPOModalOpen(false)}
        suppliers={dashboard.suppliers}
        nutrients={nutrients}
        selectedNutrientIds={selectedNutrientIds}
        onConfirmPO={handleConfirmPO}
      />
    </div>
  );
}
