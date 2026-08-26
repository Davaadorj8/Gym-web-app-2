'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { BuiltPlan, CategoryTarget, AuthUser } from '@/lib/types';
import { Button, Badge, Toast } from '@/components/ui';
import { useDashboard } from '@/lib/orchestration';
import { getDefaultPlanTitle } from '@/lib/services';
import { cn, formatCurrency, CURRENCY_SYMBOL } from '@/lib/utils';

export interface NutrientProduct {
  id: string;
  name: string;
  category: 'Supplements' | 'Shakes' | 'Beverages' | 'Snacks' | 'Vitamins';
  price: number;
  stock: number;
  servingSize?: string;
  flavor?: string;
}

interface InventoryViewProps {
  plans?: BuiltPlan[];
  onAddPlan?: (plan: BuiltPlan) => void;
  onDeletePlan?: (id: string) => void;
  totalLockers?: number;
  onSaveTotalLockers?: (count: number) => void;
  currentUser?: AuthUser;
}

type ActiveInventoryTab = 'plan-builder' | 'locker-management' | 'nutrients';

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

  // Plan Builder State
  const [categoryTarget, setCategoryTarget] = useState<CategoryTarget>('over18');
  const [customTitle, setCustomTitle] = useState('');
  const [specializedLessons, setSpecializedLessons] = useState('');
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);

  // Nutrients State
  const [nutrients, setNutrients] = useState<NutrientProduct[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('arche_nutrient_inventory');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [isNutrientModalOpen, setIsNutrientModalOpen] = useState(false);
  const [nutrientForm, setNutrientForm] = useState<{
    name: string;
    category: NutrientProduct['category'];
    price: number;
    stock: number;
    flavor: string;
  }>({
    name: '',
    category: 'Supplements',
    price: 0,
    stock: 0,
    flavor: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('arche_nutrient_inventory', JSON.stringify(nutrients));
      } catch {
        // ignore
      }
    }
  }, [nutrients]);

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

    const newPlan: BuiltPlan = {
      id: `plan-${Date.now()}`,
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

    const newProduct: NutrientProduct = {
      id: `nutr-${Date.now()}`,
      name: nutrientForm.name.trim(),
      category: nutrientForm.category,
      price: Math.max(0, Number(nutrientForm.price) || 0),
      stock: Math.max(0, Number(nutrientForm.stock) || 0),
      flavor: nutrientForm.flavor.trim() || undefined,
    };

    setNutrients((prev) => [newProduct, ...prev]);
    setIsNutrientModalOpen(false);
    setNutrientForm({
      name: '',
      category: 'Supplements',
      price: 0,
      stock: 0,
      flavor: '',
    });
    showToast('Nutrient product added to inventory');
  };

  const handleDeleteNutrient = (id: string) => {
    setNutrients((prev) => prev.filter((n) => n.id !== id));
    showToast('Product removed from inventory');
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
        </div>
      </div>

      {/* 1. MEMBERSHIP PLAN BUILDER TAB */}
      {activeTab === 'plan-builder' && (
        <div className="space-y-6">
          <div
            id="card-plan-builder"
            className="bg-[#0B132B]/80 dark:bg-[#0D1527] border border-border/80 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#070D1E] border border-border/80 flex items-center justify-center shrink-0 text-[#D4FF00]">
                <Package className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                  {t('planBuilderTitle')}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('planBuilderSubtitle')}
                </p>
              </div>
            </div>

            <form onSubmit={handleBuildPlan} className="space-y-6">
              {/* STEP 1: SELECT BLOCK 1 (CATEGORY TARGET) */}
              <div id="block-1-category-target" className="space-y-3">
                <div className="flex items-center gap-2 text-[#D4FF00] font-mono font-bold text-xs tracking-wider uppercase">
                  <Layers className="w-3.5 h-3.5 text-[#D4FF00]" />
                  <span>{t('block1Title')}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Option 1: Under 18 */}
                  <div
                    id="cat-target-under18"
                    onClick={() => setCategoryTarget('under18')}
                    className={cn(
                      'p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none',
                      categoryTarget === 'under18'
                        ? 'bg-[#070D1E] border-[#D4FF00] ring-1 ring-[#D4FF00]'
                        : 'bg-[#070D1E]/60 border-border/70 hover:border-border hover:bg-[#070D1E]'
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-center shrink-0 mt-0.5">
                      <Award className="w-4 h-4 text-[#D4FF00]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-[#D4FF00] font-mono leading-none">
                        18-
                      </span>
                      <span className="text-xs font-bold text-foreground mt-1 leading-tight">
                        {t('catUnder18Title')}
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-1 leading-normal">
                        {t('catUnder18Desc')}
                      </span>
                    </div>
                  </div>

                  {/* Option 2: Over 18 (Adult) */}
                  <div
                    id="cat-target-over18"
                    onClick={() => setCategoryTarget('over18')}
                    className={cn(
                      'p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none',
                      categoryTarget === 'over18'
                        ? 'bg-[#070D1E] border-[#D4FF00] ring-1 ring-[#D4FF00]'
                        : 'bg-[#070D1E]/60 border-border/70 hover:border-border hover:bg-[#070D1E]'
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-center shrink-0 mt-0.5">
                      <UserCheck className="w-4 h-4 text-[#D4FF00]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-[#D4FF00] font-mono leading-none">
                        18+
                      </span>
                      <span className="text-xs font-bold text-foreground mt-1 leading-tight">
                        {t('catOver18Title')}
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-1 leading-normal">
                        {t('catOver18Desc')}
                      </span>
                    </div>
                  </div>

                  {/* Option 3: Organization / Corporate */}
                  <div
                    id="cat-target-organization"
                    onClick={() => setCategoryTarget('organization')}
                    className={cn(
                      'p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none',
                      categoryTarget === 'organization'
                        ? 'bg-[#070D1E] border-[#D4FF00] ring-1 ring-[#D4FF00]'
                        : 'bg-[#070D1E]/60 border-border/70 hover:border-border hover:bg-[#070D1E]'
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4 text-[#D4FF00]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-[#D4FF00] font-mono leading-none">
                        ORG
                      </span>
                      <span className="text-xs font-bold text-foreground mt-1 leading-tight">
                        {t('catOrgTitle')}
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-1 leading-normal">
                        {t('catOrgDesc')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2: BLOCK 2 (CUSTOM TITLE & SPECIALIZED TRAINING LESSONS) */}
              <div id="block-2-custom-inputs" className="space-y-3">
                <div className="flex items-center gap-2 text-[#D4FF00] font-mono font-bold text-xs tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4FF00]" />
                  <span>{t('block2Title')}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div id="field-custom-plan-title" className="space-y-2">
                    <label
                      htmlFor="input-custom-plan-title"
                      className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono"
                    >
                      {t('customPlanTitleLabel')}
                    </label>
                    <input
                      id="input-custom-plan-title"
                      type="text"
                      placeholder={t('customPlanTitlePlaceholder')}
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] focus:ring-1 focus:ring-[#D4FF00] text-sm text-foreground placeholder:text-muted-foreground/60 rounded-xl px-4 py-3 outline-none transition-all"
                    />
                  </div>

                  <div id="field-specialized-lessons" className="space-y-2">
                    <label
                      htmlFor="input-specialized-lessons"
                      className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono"
                    >
                      {t('specializedLessonsLabel')}
                    </label>
                    <input
                      id="input-specialized-lessons"
                      type="text"
                      placeholder={t('specializedLessonsPlaceholder')}
                      value={specializedLessons}
                      onChange={(e) => setSpecializedLessons(e.target.value)}
                      className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] focus:ring-1 focus:ring-[#D4FF00] text-sm text-foreground placeholder:text-muted-foreground/60 rounded-xl px-4 py-3 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 3: BLOCK 3 (DURATION & PRICING) */}
              <div id="block-3-duration-pricing" className="space-y-3">
                <div className="flex items-center gap-2 text-[#D4FF00] font-mono font-bold text-xs tracking-wider uppercase">
                  <DollarSign className="w-3.5 h-3.5 text-[#D4FF00]" />
                  <span>{t('block3Title')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
                  <div id="field-duration-months" className="sm:col-span-3 space-y-2">
                    <label
                      htmlFor="input-duration-months"
                      className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono"
                    >
                      {t('durationMonthsLabel')}
                    </label>
                    <input
                      id="input-duration-months"
                      type="number"
                      min="1"
                      max="36"
                      required
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(Number(e.target.value))}
                      className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] focus:ring-1 focus:ring-[#D4FF00] text-sm text-foreground font-mono rounded-xl px-4 py-3 outline-none transition-all"
                    />
                  </div>

                  <div id="field-price-usd" className="sm:col-span-4 space-y-2">
                    <label
                      htmlFor="input-price-usd"
                      className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono"
                    >
                      {t('priceUsdLabel')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
                        ₮
                      </span>
                      <input
                        id="input-price-usd"
                        type="number"
                        min="0"
                        step="1000"
                        required
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] focus:ring-1 focus:ring-[#D4FF00] text-sm text-foreground font-mono pl-8 pr-4 py-3 rounded-xl outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-5">
                    <button
                      id="btn-build-save-plan"
                      type="submit"
                      className="w-full h-11 bg-[#D4FF00] hover:bg-[#c3eb00] text-black font-extrabold text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4FF00]/10 active:scale-[0.99]"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>{t('buildSavePlanBtn')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* ACTIVE BUILT PLANS INVENTORY */}
          <div id="section-active-plans-inventory" className="space-y-3 pt-2">
            <div className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
              {t('activeBuiltPlansTitle', { count: plans.length })}
            </div>

            {plans.length === 0 ? (
              <div className="bg-[#0B132B]/40 border border-border/60 rounded-2xl p-8 text-center text-muted-foreground text-xs font-mono">
                No active membership plans built yet. Fill out the form above to add plans.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const durationText = `${plan.durationMonths} ${
                    plan.durationMonths === 1 ? 'Month' : 'Months'
                  }`;

                  return (
                    <div
                      key={plan.id}
                      id={`inventory-plan-${plan.id}`}
                      className="bg-[#0B132B]/80 dark:bg-[#0D1527] border border-border/80 rounded-2xl p-5 flex flex-col justify-between gap-4 relative group hover:border-[#D4FF00]/40 transition-all shadow-md"
                    >
                      {/* Top badges & Title */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <Badge variant={getCategoryBadgeVariant(plan.categoryTarget)}>
                              {getCategoryBadgeLabel(plan.categoryTarget)}
                            </Badge>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {durationText}
                            </span>
                          </div>

                          {isAdmin && (
                            <button
                              id={`btn-delete-plan-${plan.id}`}
                              type="button"
                              onClick={() => handleDeletePlan(plan.id)}
                              title="Delete plan"
                              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-foreground tracking-wide">
                          {plan.title}
                        </h3>

                        {plan.specializedLessons && (
                          <p className="text-[11px] text-muted-foreground mt-1 font-mono italic">
                            {plan.specializedLessons}
                          </p>
                        )}
                      </div>

                      {/* Bottom Price Bar */}
                      <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {t('planPriceLabel') || 'Plan Price:'}
                        </span>
                        <div className="bg-[#070D1E] border border-border/80 rounded-lg px-3 py-1 flex items-center gap-1">
                          <span className="text-sm font-extrabold text-[#D4FF00] font-mono">
                            {formatCurrency(plan.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. LOCKER MANAGEMENT TAB */}
      {activeTab === 'locker-management' && (
        <div
          id="card-locker-capacity"
          className="bg-[#0B132B]/80 dark:bg-[#0D1527] border border-border/80 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl"
        >
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#070D1E] border border-border/80 flex items-center justify-center shrink-0 text-[#D4FF00]">
              <Lock className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                {t('lockerCapTitle')}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('lockerCapSubtitle')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveLockers} className="space-y-3 pt-2">
            <label
              htmlFor="input-total-lockers"
              className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono"
            >
              {t('totalGymLockersLabel')}
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <input
                  id="input-total-lockers"
                  type="number"
                  min="0"
                  value={lockerCount}
                  onChange={(e) => setLockerCount(Number(e.target.value))}
                  required
                  className="w-full bg-[#070D1E] border border-border/80 focus:border-[#D4FF00] focus:ring-1 focus:ring-[#D4FF00] text-sm text-foreground font-mono rounded-xl px-4 py-3 outline-none transition-all"
                />
              </div>

              <button
                id="btn-save-lockers"
                type="submit"
                className="h-11 bg-[#D4FF00] hover:bg-[#c3eb00] text-black font-extrabold text-xs tracking-wider px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4FF00]/10 active:scale-[0.99]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{lockerSaved ? 'Saved!' : t('saveLockerBtn')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

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
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#070D1E] border border-border/80 flex items-center justify-center text-[#D4FF00]">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-foreground">
                        {t('nutrientsTitle') || 'Nutrient Inventory'}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {nutrients.length} nutritional items in stock
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nutrients.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#070D1E] border border-border/80 rounded-xl p-4 flex flex-col justify-between gap-3 relative group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#D4FF00]">
                            {item.category}
                          </span>
                          <h4 className="text-sm font-bold text-foreground mt-0.5">
                            {item.name}
                          </h4>
                          {item.flavor && (
                            <p className="text-[11px] text-muted-foreground font-mono italic">
                              Flavor: {item.flavor}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteNutrient(item.id)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                        <span className="text-muted-foreground">
                          Stock: <strong className="text-foreground">{item.stock}</strong>
                        </span>
                        <div className="bg-muted/40 border border-border/60 rounded px-2 py-0.5 text-[#D4FF00] font-bold font-mono">
                          {formatCurrency(item.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
    </div>
  );
}
