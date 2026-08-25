'use client';

import React, { useState } from 'react';
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
  Layers,
} from 'lucide-react';
import { BuiltPlan, CategoryTarget, AuthUser } from '@/lib/types';
import { Button, Badge, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Toast } from '@/components/ui';
import { useDashboard } from '@/lib/orchestration';
import { getDefaultPlanTitle } from '@/lib/services';

interface InventoryViewProps {
  plans?: BuiltPlan[];
  onAddPlan?: (plan: BuiltPlan) => void;
  onDeletePlan?: (id: string) => void;
  totalLockers?: number;
  onSaveTotalLockers?: (count: number) => void;
  currentUser?: AuthUser;
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

  // Locker State
  const [lockerCount, setLockerCount] = useState<number>(totalLockers);
  const [lockerSaved, setLockerSaved] = useState(false);

  // Plan Builder State
  const [categoryTarget, setCategoryTarget] = useState<CategoryTarget>('over18');
  const [customTitle, setCustomTitle] = useState('');
  const [specializedLessons, setSpecializedLessons] = useState('');
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);

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

      {/* 1. LOCKER CAPACITY MANAGEMENT */}
      <Card id="card-locker-capacity">
        <CardHeader className="flex flex-row items-start gap-3.5 pb-4">
          <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-primary" strokeWidth={2.2} />
          </div>
          <div>
            <CardTitle>{t('lockerCapTitle')}</CardTitle>
            <CardDescription>{t('lockerCapSubtitle')}</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {isAdmin ? (
            <form onSubmit={handleSaveLockers} className="space-y-2">
              <label
                htmlFor="input-total-lockers"
                className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono"
              >
                {t('totalGymLockersLabel')}
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Input
                    id="input-total-lockers"
                    type="number"
                    min="0"
                    value={lockerCount}
                    onChange={(e) => setLockerCount(Number(e.target.value))}
                    required
                  />
                </div>
                <Button
                  id="btn-save-lockers"
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="h-10"
                >
                  <Check className="w-4 h-4 mr-1.5 stroke-[3]" />
                  <span>{lockerSaved ? 'Saved!' : t('saveLockerBtn')}</span>
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between bg-muted/40 border border-border rounded-xl px-4 py-3">
              <span className="text-xs text-muted-foreground font-mono">
                Total Active Locker Capacity:
              </span>
              <span className="text-sm font-bold text-primary font-mono">
                {lockerCount} lockers configured
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. MEMBERSHIP PLAN BUILDER */}
      <Card id="card-plan-builder" className="space-y-4">
        <CardHeader className="flex flex-row items-start gap-3.5 pb-2">
          <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-primary" strokeWidth={2.2} />
          </div>
          <div>
            <CardTitle>{t('planBuilderTitle')}</CardTitle>
            <CardDescription>{t('planBuilderSubtitle')}</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {isAdmin ? (
            <form onSubmit={handleBuildPlan} className="space-y-6">
              {/* STEP 1: SELECT BLOCK 1 (CATEGORY TARGET) */}
              <div id="block-1-category-target" className="space-y-3">
                <div className="flex items-center gap-2 text-primary font-mono font-bold text-xs tracking-wider uppercase">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span>{t('block1Title')}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Option 1: Under 18 */}
                  <div
                    id="cat-target-under18"
                    onClick={() => setCategoryTarget('under18')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      categoryTarget === 'under18'
                        ? 'bg-muted border-primary shadow-xs ring-1 ring-primary'
                        : 'bg-card border-border hover:border-border hover:bg-muted/40'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <Award className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-primary font-mono leading-none">
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
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      categoryTarget === 'over18'
                        ? 'bg-muted border-primary shadow-xs ring-1 ring-primary'
                        : 'bg-card border-border hover:border-border hover:bg-muted/40'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <UserCheck className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-primary font-mono leading-none">
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
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      categoryTarget === 'organization'
                        ? 'bg-muted border-primary shadow-xs ring-1 ring-primary'
                        : 'bg-card border-border hover:border-border hover:bg-muted/40'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-primary font-mono leading-none">
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
                <div className="flex items-center gap-2 text-primary font-mono font-bold text-xs tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>{t('block2Title')}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div id="field-custom-plan-title">
                    <label
                      htmlFor="input-custom-plan-title"
                      className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono mb-2"
                    >
                      {t('customPlanTitleLabel')}
                    </label>
                    <Input
                      id="input-custom-plan-title"
                      type="text"
                      placeholder={t('customPlanTitlePlaceholder')}
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                    />
                  </div>

                  <div id="field-specialized-lessons">
                    <label
                      htmlFor="input-specialized-lessons"
                      className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono mb-2"
                    >
                      {t('specializedLessonsLabel')}
                    </label>
                    <Input
                      id="input-specialized-lessons"
                      type="text"
                      placeholder={t('specializedLessonsPlaceholder')}
                      value={specializedLessons}
                      onChange={(e) => setSpecializedLessons(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* STEP 3: BLOCK 3 (DURATION & PRICING) */}
              <div id="block-3-duration-pricing" className="space-y-3">
                <div className="flex items-center gap-2 text-primary font-mono font-bold text-xs tracking-wider uppercase">
                  <DollarSign className="w-3.5 h-3.5 text-primary" />
                  <span>{t('block3Title')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div id="field-duration-months" className="sm:col-span-4">
                    <label
                      htmlFor="input-duration-months"
                      className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono mb-2"
                    >
                      {t('durationMonthsLabel')}
                    </label>
                    <Input
                      id="input-duration-months"
                      type="number"
                      min="1"
                      max="36"
                      required
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(Number(e.target.value))}
                    />
                  </div>

                  <div id="field-price-usd" className="sm:col-span-4">
                    <label
                      htmlFor="input-price-usd"
                      className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono mb-2"
                    >
                      {t('priceUsdLabel')}
                    </label>
                    <Input
                      id="input-price-usd"
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      icon={<span className="text-xs font-mono">$</span>}
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <Button
                      id="btn-build-save-plan"
                      type="submit"
                      variant="primary"
                      className="w-full h-10"
                    >
                      <Plus className="w-4 h-4 mr-1.5 stroke-[3]" />
                      <span>{t('buildSavePlanBtn')}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-muted/40 border border-border rounded-xl p-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold text-foreground">
                Plan Builder is Restricted to Admin Accounts
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Staff members can view active plans below, register athletes, and extend memberships.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. ACTIVE BUILT PLANS INVENTORY */}
      <div id="section-active-plans-inventory" className="space-y-3">
        <div className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
          {t('activeBuiltPlansTitle', { count: plans.length })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const durationText = `${plan.durationMonths} ${
              plan.durationMonths === 1 ? 'Month' : 'Months'
            }`;

            return (
              <Card
                key={plan.id}
                id={`inventory-plan-${plan.id}`}
                className="p-5 flex flex-col justify-between gap-4 relative group hover:border-border transition-all"
              >
                {/* Top badges & Title */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={getCategoryBadgeVariant(plan.categoryTarget)}>
                        {getCategoryBadgeLabel(plan.categoryTarget)}
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {durationText}
                      </span>
                    </div>

                    {isAdmin && (
                      <Button
                        id={`btn-delete-plan-${plan.id}`}
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePlan(plan.id)}
                        title="Delete plan"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
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
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Plan Price:
                  </span>
                  <div className="bg-muted border border-border rounded-lg px-3 py-1 flex items-center gap-1">
                    <span className="text-xs text-muted-foreground font-mono">$</span>
                    <span className="text-sm font-extrabold text-primary font-mono">
                      {plan.price}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
