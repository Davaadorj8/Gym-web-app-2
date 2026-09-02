'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Lock,
  Package,
  Award,
  UserCheck,
  Building2,
  Sparkles,
  DollarSign,
  Plus,
  Trash2,
  Check,
  ShoppingCart,
  Layers,
  Calendar,
  X,
  Edit2,
  AlertCircle,
  Wrench,
  Key,
  KeyRound,
  Search,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { BuiltPlan, CategoryTarget, AuthUser, LockerCustomStatus } from '@/lib/types';
import { Button, Badge, Toast } from '@/components/ui';
import { useDashboard } from '@/lib/orchestration';
import { getDefaultPlanTitle, generateLockerList, formatLockerNumber } from '@/lib/services';
import { cn, formatCurrency, CURRENCY_SYMBOL, getNutrientExpiryStatus } from '@/lib/utils';
import { NutrientProduct } from '@/lib/types';
import { InventoryStatsCards } from './inventory/InventoryStatsCards';
import { InventoryFilters } from './inventory/InventoryFilters';
import { InventoryTable } from './inventory/InventoryTable';
import { MembershipPlanBuilderTab } from './inventory/MembershipPlanBuilderTab';
import { LockerManagementTab } from './inventory/LockerManagementTab';
import { SuppliersAndPOTab } from './inventory/SuppliersAndPOTab';


interface InventoryViewProps {
  plans?: BuiltPlan[];
  onAddPlan?: (plan: BuiltPlan) => void;
  onDeletePlan?: (id: string) => void;
  totalLockers?: number;
  onSaveTotalLockers?: (count: number) => void;
  currentUser?: AuthUser;
}

type ActiveInventoryTab = 'plan-builder' | 'locker-management' | 'nutrients' | 'purchase-orders';

function createUniqueId(prefix: string): string {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function InventoryView({
  plans: propPlans,
  onAddPlan: propOnAddPlan,
  onDeletePlan: propOnDeletePlan,
  totalLockers: propTotalLockers,
  onSaveTotalLockers: propOnSaveTotalLockers,
  currentUser: propCurrentUser,
}: InventoryViewProps) {
  const dashboard = useDashboard();
  const plans = propPlans ?? dashboard.plans;
  const totalLockers = propTotalLockers ?? dashboard.totalLockers;
  const currentUser = propCurrentUser ?? dashboard.currentUser;

  const isAdmin = !currentUser || currentUser.role === 'admin';
  const t = useTranslations('Inventory');

  // Sub-tabs State
  const [activeTab, setActiveTab] = useState<ActiveInventoryTab>('plan-builder');

  // Locker State
  const [lockerCount, setLockerCount] = useState<number>(totalLockers);
  const [lockerSaved, setLockerSaved] = useState(false);

  // Specific Locker Status Management State & Logic
  const [targetLockerNumber, setTargetLockerNumber] = useState<string>('Locker #01');
  const [targetStatus, setTargetStatus] = useState<LockerCustomStatus>('clean');
  const [statusNotes, setStatusNotes] = useState<string>('');
  const [lockerSearchQuery, setLockerSearchQuery] = useState<string>('');
  const [gridFilterStatus, setGridFilterStatus] = useState<LockerCustomStatus | 'all'>('all');

  const lockerList = useMemo(() => {
    return generateLockerList(totalLockers);
  }, [totalLockers]);

  const occupiedLockerMap = useMemo(() => {
    const map = new Map<string, string>();
    dashboard.members.forEach((m) => {
      if (m.occupancyStatus === 'Checked In' && m.assignedLocker) {
        map.set(m.assignedLocker, `${m.firstName} ${m.lastName}`.trim());
      }
    });
    return map;
  }, [dashboard.members]);

  const handleUpdateSingleLockerStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLockerNumber) return;

    dashboard.updateLockerStatus(targetLockerNumber, targetStatus, statusNotes.trim() || undefined);

    const statusLabels: Record<LockerCustomStatus, string> = {
      clean: 'Clean / Sanitized',
      repair: 'Needs Repair / Fix',
      key_lost: 'Key Reported Lost',
      key_not_returned: 'Key Overdue / Not Returned',
      inactive: 'Inactive / Out of Service',
      available: 'Available / Functional',
      occupied: 'Occupied',
    };

    showToast(`${targetLockerNumber} status updated to "${statusLabels[targetStatus]}"`);
    setStatusNotes('');
  };

  const getLockerStatusConfig = React.useCallback(
    (lockerNum: string) => {
      const isOccupied = occupiedLockerMap.has(lockerNum);
      const customStatus = dashboard.lockerStatuses[lockerNum];

      if (customStatus && customStatus !== 'available') {
        switch (customStatus) {
          case 'clean':
            return {
              label: 'Needs Cleaning',
              bg: 'bg-amber-500/10 border-amber-500/40 text-amber-400',
              badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
              icon: Sparkles,
              code: 'clean' as LockerCustomStatus,
            };
          case 'repair':
            return {
              label: 'Needs Repair / Fix',
              bg: 'bg-orange-500/10 border-orange-500/40 text-orange-400',
              badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
              icon: Wrench,
              code: 'repair' as LockerCustomStatus,
            };
          case 'key_lost':
            return {
              label: 'Key Lost',
              bg: 'bg-rose-500/10 border-rose-500/40 text-rose-400',
              badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
              icon: KeyRound,
              code: 'key_lost' as LockerCustomStatus,
            };
          case 'key_not_returned':
            return {
              label: 'Key Not Returned',
              bg: 'bg-purple-500/10 border-purple-500/40 text-purple-400',
              badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
              icon: Key,
              code: 'key_not_returned' as LockerCustomStatus,
            };
          case 'inactive':
            return {
              label: 'Inactive',
              bg: 'bg-slate-500/10 border-slate-500/40 text-slate-400',
              badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
              icon: AlertCircle,
              code: 'inactive' as LockerCustomStatus,
            };
          case 'occupied':
            return {
              label: 'Occupied',
              bg: 'bg-sky-500/10 border-sky-500/40 text-sky-400',
              badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
              icon: UserCheck,
              code: 'occupied' as LockerCustomStatus,
            };
        }
      }

      if (isOccupied) {
        return {
          label: 'Occupied',
          bg: 'bg-sky-500/10 border-sky-500/40 text-sky-400',
          badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
          icon: UserCheck,
          code: 'occupied' as LockerCustomStatus,
        };
      }

      return {
        label: 'Available',
        bg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        icon: CheckCircle2,
        code: 'available' as LockerCustomStatus,
      };
    },
    [occupiedLockerMap, dashboard.lockerStatuses]
  );

  const statusSummary = useMemo(() => {
    let clean = 0;
    let repair = 0;
    let keyLost = 0;
    let keyNotReturned = 0;
    let inactive = 0;
    let occupied = 0;
    let available = 0;

    lockerList.forEach((num) => {
      const isOccupied = occupiedLockerMap.has(num);
      const custom = dashboard.lockerStatuses[num];

      if (custom && custom !== 'available') {
        if (custom === 'clean') clean++;
        else if (custom === 'repair') repair++;
        else if (custom === 'key_lost') keyLost++;
        else if (custom === 'key_not_returned') keyNotReturned++;
        else if (custom === 'inactive') inactive++;
        else if (custom === 'occupied') occupied++;
      } else if (isOccupied) {
        occupied++;
      } else {
        available++;
      }
    });

    return {
      total: lockerList.length,
      available,
      occupied,
      clean,
      repair,
      keyLost,
      keyNotReturned,
      inactive,
    };
  }, [lockerList, occupiedLockerMap, dashboard.lockerStatuses]);

  const filteredLockerGrid = useMemo(() => {
    return lockerList.filter((num) => {
      if (lockerSearchQuery.trim()) {
        const q = lockerSearchQuery.toLowerCase().trim();
        const cfg = getLockerStatusConfig(num);
        const occupant = occupiedLockerMap.get(num) || '';
        const matchNumber = num.toLowerCase().includes(q);
        const matchStatus = cfg.label.toLowerCase().includes(q);
        const matchOccupant = occupant.toLowerCase().includes(q);
        if (!matchNumber && !matchStatus && !matchOccupant) return false;
      }

      if (gridFilterStatus !== 'all') {
        const cfg = getLockerStatusConfig(num);
        if (cfg.code !== gridFilterStatus) return false;
      }

      return true;
    });
  }, [lockerList, lockerSearchQuery, gridFilterStatus, occupiedLockerMap, getLockerStatusConfig]);

  // Plan Builder State
  const [categoryTarget, setCategoryTarget] = useState<CategoryTarget>('over18');
  const [customTitle, setCustomTitle] = useState('');
  const [specializedLessons, setSpecializedLessons] = useState('');
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);

  // Nutrients State via central DashboardContext
  const nutrients = dashboard.nutrients;

  // Search, Stock Filtering, and Batch actions states for Nutrients
  const [nutrientSearchQuery, setNutrientSearchQuery] = useState('');
  const [nutrientFilterStock, setNutrientFilterStock] = useState<'all' | 'low' | 'out'>('all');
  const [selectedNutrientIds, setSelectedNutrientIds] = useState<string[]>([]);

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

  // Suppliers & PO states
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [poSupplierId, setPoSupplierId] = useState<string>('');
  const [poItemsMap, setPoItemsMap] = useState<Record<string, { quantity: number; unitPurchaseCost: number }>>({});
  
  // Inline Supplier Form States
  const [newSupplierForm, setNewSupplierForm] = useState({
    name: '',
    contactEmail: '',
    phone: '',
    leadTimeDays: 3,
  });

  const handleOpenPOModal = () => {
    if (selectedNutrientIds.length === 0) return;
    if (dashboard.suppliers.length > 0 && !poSupplierId) {
      setPoSupplierId(dashboard.suppliers[0].id);
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
    setIsPOModalOpen(true);
  };

  const handleConfirmPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierId) {
      showToast('Please select a supplier');
      return;
    }
    const supplier = dashboard.suppliers.find((s) => s.id === poSupplierId);
    if (!supplier) return;

    const poItems = selectedNutrientIds.map((id) => {
      const item = nutrients.find((n) => n.id === id);
      const values = poItemsMap[id] || { quantity: 10, unitPurchaseCost: 0 };
      return {
        id: createUniqueId('poi'),
        productId: id,
        productName: item?.name || 'Unknown',
        quantity: values.quantity,
        unitPurchaseCost: values.unitPurchaseCost,
      };
    });

    const totalCost = poItems.reduce((acc, x) => acc + x.quantity * x.unitPurchaseCost, 0);
    const uniqueId = createUniqueId('po');

    const newPO = {
      id: uniqueId,
      supplierId: supplier.id,
      supplierName: supplier.name,
      status: 'ORDERED' as const,
      items: poItems,
      totalCost,
      createdAt: new Date().toISOString(),
    };

    dashboard.createPurchaseOrder(newPO);
    setIsPOModalOpen(false);
    setSelectedNutrientIds([]);
    showToast(`Purchase Order ${newPO.id} successfully generated & ordered.`);
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierForm.name.trim()) return;
    const uniqueId = createUniqueId('sup');
    dashboard.addSupplier({
      id: uniqueId,
      name: newSupplierForm.name.trim(),
      contactEmail: newSupplierForm.contactEmail.trim() || 'info@supplier.mn',
      phone: newSupplierForm.phone.trim() || '9900-1122',
      leadTimeDays: Number(newSupplierForm.leadTimeDays) || 3,
    });
    setNewSupplierForm({
      name: '',
      contactEmail: '',
      phone: '',
      leadTimeDays: 3,
    });
    showToast('New nutrient supplier registered.');
  };

  const handleBatchDelete = () => {
    if (selectedNutrientIds.length === 0) return;
    selectedNutrientIds.forEach((id) => {
      dashboard.deleteNutrient(id);
    });
    showToast(`Deleted ${selectedNutrientIds.length} selected products.`);
    setSelectedNutrientIds([]);
  };

  const [isNutrientModalOpen, setIsNutrientModalOpen] = useState(false);
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

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSaveLockers = (e: React.FormEvent) => {
    e.preventDefault();
    const count = Number(lockerCount) || 0;
    if (propOnSaveTotalLockers) {
      propOnSaveTotalLockers(count);
    } else {
      dashboard.saveTotalLockers(count);
    }
    setLockerSaved(true);
    showToast(t('lockerCapacitySaved'));
    setTimeout(() => setLockerSaved(false), 2500);
  };

  const handleBuildPlan = (e: React.FormEvent) => {
    e.preventDefault();

    const fallbackTitleEn = getDefaultPlanTitle(categoryTarget, false);
    const fallbackTitleMn = getDefaultPlanTitle(categoryTarget, true);

    const finalTitle = customTitle.trim() || fallbackTitleEn;
    const finalTitleMn = customTitle.trim() || fallbackTitleMn;

    const uniqueId = typeof window !== 'undefined' && window.crypto ? window.crypto.randomUUID() : 'plan-new';
    const newPlan: BuiltPlan = {
      id: `plan-${uniqueId}`,
      categoryTarget,
      title: finalTitle,
      titleMn: finalTitleMn,
      specializedLessons: specializedLessons.trim() || undefined,
      durationMonths: Math.max(1, Number(durationMonths) || 1),
      price: Math.max(0, Number(price) || 0),
      isCustom: true,
    };

    if (propOnAddPlan) {
      propOnAddPlan(newPlan);
    } else {
      dashboard.addPlan(newPlan);
    }
    showToast(t('planCreated'));

    // Reset inputs
    setCustomTitle('');
    setSpecializedLessons('');
  };

  const handleDeletePlan = (id: string) => {
    if (propOnDeletePlan) {
      propOnDeletePlan(id);
    } else {
      dashboard.deletePlan(id);
    }
    showToast(t('planDeleted'));
  };

  const handleAddNutrient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nutrientForm.name.trim()) return;

    const uniqueNutrId = typeof window !== 'undefined' && window.crypto ? window.crypto.randomUUID() : 'nutr-new';
    const newProduct: NutrientProduct = {
      id: `nutr-${uniqueNutrId}`,
      name: nutrientForm.name.trim(),
      category: nutrientForm.category,
      price: Math.max(0, Number(nutrientForm.price) || 0),
      stock: Math.max(0, Number(nutrientForm.stock) || 0),
      flavor: nutrientForm.flavor.trim() || undefined,
      bestBeforeDate: nutrientForm.bestBeforeDate ? nutrientForm.bestBeforeDate : undefined,
    };

    dashboard.addNutrient(newProduct);
    setIsNutrientModalOpen(false);
    setNutrientForm({
      name: '',
      category: 'Supplements',
      price: 0,
      stock: 0,
      flavor: '',
      bestBeforeDate: '',
    });
    showToast('Nutrient product added to inventory');
  };

  const handleDeleteNutrient = (id: string) => {
    dashboard.deleteNutrient(id);
    showToast('Product removed from inventory');
  };

  // Price Update State & Handlers
  const [editingNutrientId, setEditingNutrientId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');

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

  // Sale Recording State & Handlers
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [saleProduct, setSaleProduct] = useState<NutrientProduct | null>(null);
  const [saleQuantity, setSaleQuantity] = useState<number>(1);
  const [salePaymentMethod, setSalePaymentMethod] = useState<string>('QPay');
  const [saleMemberName, setSaleMemberName] = useState<string>('');

  const handleOpenSaleModal = (product: NutrientProduct) => {
    if (product.stock <= 0) {
      showToast('Cannot sell product: Item is out of stock.');
      return;
    }
    setSaleProduct(product);
    setSaleQuantity(1);
    setSalePaymentMethod('QPay');
    setSaleMemberName('');
    setIsSaleModalOpen(true);
  };

  const handleConfirmSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleProduct) return;

    if (saleQuantity <= 0) {
      showToast('Please enter a valid sale quantity.');
      return;
    }

    if (saleQuantity > saleProduct.stock) {
      showToast(`Cannot sell more than available stock (${saleProduct.stock} units).`);
      return;
    }

    const unitPrice = saleProduct.price; // Locked at current listed price
    const totalPrice = unitPrice * saleQuantity;

    dashboard.recordNutrientSale({
      productId: saleProduct.id,
      productName: saleProduct.name,
      category: saleProduct.category,
      quantity: saleQuantity,
      unitPrice,
      totalPrice,
      paymentMethod: salePaymentMethod,
      memberName: saleMemberName.trim() || 'Walk-in Customer',
      staffLogged: currentUser?.name || 'Staff',
    });

    setIsSaleModalOpen(false);
    setSaleProduct(null);
    showToast(`Logged sale of ${saleQuantity}x ${saleProduct.name} at ${formatCurrency(unitPrice)} each (Total: ${formatCurrency(totalPrice)}). Locked for analytics.`);
  };

  const getCategoryBadgeVariant = (cat: CategoryTarget): 'warning' | 'success' | 'info' => {
    switch (cat) {
      case 'under18':
        return 'warning';
      case 'over18':
        return 'success';
      case 'organization':
        return 'info';
    }
  };

  const getCategoryBadgeLabel = (cat: CategoryTarget) => {
    switch (cat) {
      case 'under18':
        return t('badgeUnder18');
      case 'over18':
        return t('badgeOver18');
      case 'organization':
        return t('badgeOrg');
    }
  };

  if (!isAdmin) {
    return (
      <div id="inventory-access-denied" className="w-full py-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">{t('adminOnly') || 'Admin Access Only'}</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            {t('inventoryAdminRestricted') || 'Inventory and plan configuration are restricted to Admin accounts.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="inventory-view-root" className="w-full space-y-6">
      {/* Toast Notification */}
      <Toast id="inventory-toast" message={toastMessage} type="success" />

      {/* Top Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t('title') || 'Inventory Management'}
        </h1>

        {/* Navigation Underline Tabs */}
        <div className="flex items-center gap-6 border-b border-border/80 text-xs font-mono font-bold tracking-wider overflow-x-auto select-none pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('plan-builder')}
            className={cn(
              'pb-2.5 px-0.5 border-b-2 transition-all cursor-pointer whitespace-nowrap',
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
              'pb-2.5 px-0.5 border-b-2 transition-all cursor-pointer whitespace-nowrap',
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
              'pb-2.5 px-0.5 border-b-2 transition-all cursor-pointer whitespace-nowrap',
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
              'pb-2.5 px-0.5 border-b-2 transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'purchase-orders'
                ? 'text-[#D4FF00] border-[#D4FF00]'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            {t('tabPurchaseOrders') || 'SUPPLIERS & PO'}
          </button>
        </div>
      </div>

      {activeTab === 'plan-builder' && <MembershipPlanBuilderTab showToast={showToast} />}
      {activeTab === 'locker-management' && <LockerManagementTab showToast={showToast} />}
      {/* 3. NUTRIENTS TAB */}
      {activeTab === 'nutrients' && (
        <div className="space-y-6">
          <div
            id="card-nutrient-inventory"
            className="bg-[#0B132B]/80 dark:bg-[#0D1527] border border-border/80 rounded-2xl p-8 sm:p-10 shadow-xl"
          >
            {nutrients.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#111C38] border border-slate-800/80 flex items-center justify-center text-[#7E8CA3]">
                  <ShoppingCart className="w-7 h-7" strokeWidth={1.8} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-foreground">
                    {t('nutrientsTitle') || 'Nutrient Inventory'}
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {t('nutrientsSubtitle') ||
                      'Manage supplements, shakes, and other nutritional products available for members.'}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNutrientModalOpen(true)}
                    className="border border-[#D4FF00]/40 text-[#D4FF00] hover:bg-[#D4FF00]/10 px-6 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('addProductBtn') || 'Add New Product'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#070D1E] border border-border/80 flex items-center justify-center text-[#D4FF00]">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-foreground">
                        {t('nutrientsTitle') || 'Nutrient Inventory'}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {nutrients.length} total nutritional items registered
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsNutrientModalOpen(true)}
                    className="border border-[#D4FF00]/40 text-[#D4FF00] hover:bg-[#D4FF00]/10 px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2"
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

      {/* Nutrient Creation Modal */}
      {isNutrientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-border rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4 text-[#D4FF00]" />
                <h3 className="text-sm font-bold text-foreground">Add Nutrient Product</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNutrientModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNutrient} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whey Isolate Protein Shake"
                  value={nutrientForm.name}
                  onChange={(e) => setNutrientForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-sm text-foreground rounded-xl px-3.5 py-2.5 outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
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
                    className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-xl px-3 py-2.5 outline-none font-mono"
                  >
                    <option value="Supplements">Supplements</option>
                    <option value="Shakes">Shakes</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Vitamins">Vitamins</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
                    Flavor / Specs
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vanilla / 500ml"
                    value={nutrientForm.flavor}
                    onChange={(e) => setNutrientForm((f) => ({ ...f, flavor: e.target.value }))}
                    className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-xl px-3 py-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
                    Unit Price (₮ MNT)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs">
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
                      className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-sm font-mono text-foreground rounded-xl pl-7 pr-3 py-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
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
                    className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-sm font-mono text-foreground rounded-xl px-3 py-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
                  Best Before Date (Expiry)
                </label>
                <input
                  type="date"
                  value={nutrientForm.bestBeforeDate}
                  onChange={(e) => setNutrientForm((f) => ({ ...f, bestBeforeDate: e.target.value }))}
                  className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-xl px-3 py-2.5 outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setIsNutrientModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#D4FF00] hover:bg-[#c3eb00] text-black font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md transition-all"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Nutrient Sale Record Modal */}
      {isSaleModalOpen && saleProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-border rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4 text-[#D4FF00]" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Record Nutrient Sale</h3>
                  <p className="text-[11px] text-muted-foreground font-mono">{saleProduct.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSaleModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmSale} className="space-y-4 font-mono text-xs">
              <div className="bg-[#070D1E] border border-border/60 rounded-xl p-3.5 space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Current Listed Price:</span>
                  <strong className="text-[#D4FF00] font-bold">{formatCurrency(saleProduct.price)}</strong>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Available Stock:</span>
                  <strong className="text-foreground font-bold">{saleProduct.stock} units</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Sale Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  max={saleProduct.stock}
                  required
                  value={saleQuantity}
                  onChange={(e) => setSaleQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-sm text-foreground rounded-xl px-3.5 py-2.5 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Payment Method
                </label>
                <select
                  value={salePaymentMethod}
                  onChange={(e) => setSalePaymentMethod(e.target.value)}
                  className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
                >
                  <option value="QPay">QPay Instant Digital</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Wire Transfer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Member / Buyer Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Walk-in Customer or Member Name"
                  value={saleMemberName}
                  onChange={(e) => setSaleMemberName(e.target.value)}
                  className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-xl px-3.5 py-2.5 outline-none font-sans"
                />
              </div>

              <div className="bg-[#111C38]/60 border border-blue-500/30 rounded-xl p-3 space-y-1 text-[11px] text-slate-300">
                <div className="flex justify-between font-bold text-foreground">
                  <span>Total Sale Amount:</span>
                  <span className="text-[#D4FF00]">{formatCurrency(saleProduct.price * saleQuantity)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  * Locks unit price at {formatCurrency(saleProduct.price)} in financial revenue records. Changing product price in the future will not modify this sale record.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setIsSaleModalOpen(false)}
                  className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#D4FF00] hover:bg-[#c3eb00] text-black font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Sale</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock & Purchase Intake / Purchase Order Modal */}
      {isPOModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-border rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-[#D4FF00]" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide font-mono">Restock &amp; Purchase Intake</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPOModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPO} className="space-y-4 font-mono text-xs">
              {/* Supplier Selection */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Select Registered Supplier
                </label>
                <select
                  value={poSupplierId}
                  onChange={(e) => setPoSupplierId(e.target.value)}
                  className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] text-xs text-foreground rounded-xl px-3 py-2.5 outline-none font-sans"
                  required
                >
                  <option value="">-- Select Supplier --</option>
                  {dashboard.suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name} ({sup.leadTimeDays}d lead)
                    </option>
                  ))}
                </select>
                {dashboard.suppliers.length === 0 && (
                  <p className="text-[10px] text-rose-400">
                    * No registered suppliers. Go to &apos;Suppliers &amp; PO&apos; sub-tab to register one first.
                  </p>
                )}
              </div>

              {/* Items in PO */}
              <div className="space-y-3">
                <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Order Items &amp; Unit Costs
                </span>

                <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                  {selectedNutrientIds.map((id) => {
                    const item = nutrients.find((n) => n.id === id);
                    if (!item) return null;
                    const values = poItemsMap[id] || { quantity: 20, unitPurchaseCost: 0 };
                    return (
                      <div key={id} className="p-3 bg-[#070D1E] border border-border/60 rounded-xl space-y-2">
                        <div className="font-sans font-bold text-foreground text-xs">
                          {item.name}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
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

                          <div className="space-y-1">
                            <label className="text-[9px] text-muted-foreground uppercase">Unit Purchase Cost (₮)</label>
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

              {/* Total Summary */}
              <div className="bg-[#111C38]/60 border border-blue-500/30 rounded-xl p-3 flex justify-between items-center text-[11px] font-bold text-foreground">
                <span>Total Estimated Cost:</span>
                <span className="text-[#D4FF00] text-sm">
                  {formatCurrency(
                    selectedNutrientIds.reduce((acc, id) => {
                      const values = poItemsMap[id] || { quantity: 20, unitPurchaseCost: 0 };
                      return acc + values.quantity * values.unitPurchaseCost;
                    }, 0)
                  )}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setIsPOModalOpen(false)}
                  className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dashboard.suppliers.length === 0}
                  className="bg-[#D4FF00] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#c3eb00] text-black font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-1.5 font-mono"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Submit Purchase Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
