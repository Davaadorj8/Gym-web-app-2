'use client';

import React, { useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import {
  Box,
  PlusCircle,
  Check,
  Clock,
  Minus,
  Plus,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { BuiltPlan, CategoryTarget } from '@/lib/types';
import { Card, Badge, Button } from '@/components/ui';
import { RegistrationFormData } from '@/features/registration';
import {
  calculateExpirationDate,
  formatDateForDisplay,
  calculateRegistrationFee,
} from '@/lib/registration-utils';

interface PlanSelectorProps {
  plans: BuiltPlan[];
  form: UseFormReturn<RegistrationFormData>;
  onNavigateToInventory?: () => void;
}

export function PlanSelector({
  plans,
  form,
  onNavigateToInventory,
}: PlanSelectorProps) {
  const t = useTranslations('Registration');
  const locale = useLocale();
  const isMn = locale === 'mn';

  const registrationType = form.watch('registrationType');
  const selectedPlanId = form.watch('selectedPlanId');
  const durationMultiplier = form.watch('durationMultiplier') || 1;
  const paymentMethod = form.watch('paymentMethod');

  // Comparison toggle state for individual registrations
  const [categoryFilter, setCategoryFilter] = React.useState<'all' | 'under18' | 'over18'>('all');

  // Filter plans based on registration mode
  const filteredPlans = useMemo(() => {
    if (registrationType === 'organization') {
      return plans.filter((p) => p.categoryTarget === 'organization');
    }
    return plans.filter((p) => p.categoryTarget !== 'organization');
  }, [plans, registrationType]);

  const displayedPlans = useMemo(() => {
    if (registrationType === 'organization') {
      return filteredPlans;
    }
    if (categoryFilter === 'all') return filteredPlans;
    return filteredPlans.filter((p) => p.categoryTarget === categoryFilter);
  }, [filteredPlans, categoryFilter, registrationType]);

  // Ensure effective plan is valid
  const effectivePlanId = useMemo(() => {
    if (filteredPlans.some((p) => p.id === selectedPlanId)) {
      return selectedPlanId;
    }
    return filteredPlans[0]?.id || '';
  }, [filteredPlans, selectedPlanId]);

  // Synchronize effective plan in form if mismatch occurs
  React.useEffect(() => {
    if (effectivePlanId && effectivePlanId !== selectedPlanId) {
      form.setValue('selectedPlanId', effectivePlanId, { shouldValidate: true });
    }
  }, [effectivePlanId, selectedPlanId, form]);

  const activePlan = filteredPlans.find((p) => p.id === effectivePlanId) || null;

  const today = new Date();
  const startDateStr = formatDateForDisplay(today);
  const expirationDateStr = calculateExpirationDate(today, durationMultiplier);

  const activePlanTitle = activePlan
    ? isMn && activePlan.titleMn
      ? activePlan.titleMn
      : activePlan.title
    : t('noPlanSelected');

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

  return (
    <div className="space-y-6">
      {/* 1. SELECT AVAILABLE MEMBERSHIP PLAN */}
      <Card id="card-membership-plan" className="p-6 shadow-xl">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-primary font-mono font-bold text-xs sm:text-sm tracking-wider uppercase">
            <Box className="w-4 h-4 text-primary" />
            <span>{t('sec2Title')}</span>
          </div>
          {onNavigateToInventory && (
            <button
              type="button"
              onClick={onNavigateToInventory}
              className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3 h-3" />
              <span>{t('goToInventoryBtn')}</span>
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {t('sec2Subtitle')}
        </p>

        {/* Subscription Plan Comparison Toggle (Only for individual registrations) */}
        {registrationType === 'individual' && (
          <div className="flex bg-muted/60 border border-border p-1 rounded-xl mb-4 gap-1">
            {[
              { id: 'all', label: isMn ? 'Бүх ангилал' : 'All Categories' },
              { id: 'over18', label: isMn ? 'Насанд хүрэгчид (18+)' : 'Adult (18+)' },
              { id: 'under18', label: isMn ? 'Хүүхэд (<18)' : 'Youth (<18)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id as any)}
                className={cn(
                  "flex-1 text-center py-1.5 text-[10px] font-mono font-bold uppercase rounded-lg transition-all",
                  categoryFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {displayedPlans.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2">
            <p>{t('noPlansYet')}</p>
            {onNavigateToInventory && (
              <button
                type="button"
                onClick={onNavigateToInventory}
                className="inline-flex items-center gap-1 text-primary font-mono text-xs hover:underline cursor-pointer"
              >
                <PlusCircle className="w-3 h-3" />
                <span>{t('goToInventoryBtn')}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {displayedPlans.map((plan) => {
              const isSelected = effectivePlanId === plan.id;
              const displayTitle = isMn && plan.titleMn ? plan.titleMn : plan.title;
              const durationText = `${plan.durationMonths} ${
                plan.durationMonths === 1 ? 'Month' : 'Months'
              }`;

              // Determine if it is a best value or recommended plan
              const isRecommended = plan.durationMonths >= 3 || plan.price > 120000;

              return (
                <div
                  key={plan.id}
                  id={`plan-card-${plan.id}`}
                  onClick={() =>
                    form.setValue('selectedPlanId', plan.id, { shouldValidate: true })
                  }
                  className={cn(
                    'p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden',
                    isSelected
                      ? 'bg-primary/5 border-primary shadow-md ring-1 ring-primary'
                      : 'bg-input border-border hover:border-primary/40 hover:bg-muted/40'
                  )}
                >
                  {isRecommended && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[8px] font-mono font-extrabold px-2.5 py-1 rounded-bl-lg uppercase tracking-wider">
                      Popular / Best Value
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1.5 min-w-0 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getCategoryBadgeVariant(plan.categoryTarget)}>
                          {getCategoryBadgeLabel(plan.categoryTarget)}
                        </Badge>
                        <h4 className="text-sm font-extrabold text-foreground tracking-wide truncate">
                          {displayTitle}
                        </h4>
                      </div>

                      <div className="space-y-1.5 text-xs text-muted-foreground mt-2">
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Gym Entry Access: {durationText}</span>
                        </div>
                        {plan.specializedLessons && (
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-primary font-bold truncate max-w-[240px]">
                              {plan.specializedLessons}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Locker Rooms & Shower Access Included</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0 mt-1">
                      <span className="text-xl font-extrabold text-primary font-mono tracking-tight">
                        {formatCurrency(plan.price)}
                      </span>
                      <span className="text-[9px] text-muted-foreground uppercase font-mono font-bold">
                        {plan.durationMonths === 1 ? 'Per Mo' : `For ${plan.durationMonths} Mos`}
                      </span>
                      
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-2">
                          <Check className="w-3.5 h-3.5 text-primary-foreground stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* 2. SELECT DURATION & SUMMARY */}
      <Card id="card-duration-summary" className="p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-mono font-bold text-xs sm:text-sm tracking-wider uppercase">
            <Clock className="w-4 h-4 text-primary" />
            <span>{t('sec3Title')}</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">{t('customStepper')}</span>
        </div>

        {/* Stepper Box */}
        <div className="bg-background border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-wide">
              {t('membershipDurationTitle')}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {t('adjustInIncrements')}
            </p>
          </div>

          <div className="bg-muted border border-border rounded-xl p-1 flex items-center gap-2 shrink-0">
            <Button
              id="btn-duration-decrease"
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                form.setValue('durationMultiplier', Math.max(1, durationMultiplier - 1), {
                  shouldValidate: true,
                })
              }
              disabled={durationMultiplier <= 1}
              aria-label="Decrease duration"
              className="h-8 w-8 rounded-lg"
            >
              <Minus className="w-3.5 h-3.5" />
            </Button>

            <div className="px-2 font-mono text-xs font-bold min-w-[70px] text-center flex items-center justify-center gap-1">
              <span className="text-primary text-sm font-extrabold">{durationMultiplier}</span>
              <span className="text-foreground">
                {durationMultiplier === 1
                  ? (isMn ? 'Сар' : 'Month')
                  : (isMn ? 'Сар' : 'Months')}
              </span>
            </div>

            <Button
              id="btn-duration-increase"
              type="button"
              variant="primary"
              size="icon"
              onClick={() =>
                form.setValue('durationMultiplier', Math.min(36, durationMultiplier + 1), {
                  shouldValidate: true,
                })
              }
              aria-label="Increase duration"
              className="h-8 w-8 rounded-lg"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </Button>
          </div>
        </div>

        {/* Breakdown Box */}
        <div
          id="plan-breakdown-box"
          className="bg-background border border-border rounded-2xl p-4 sm:p-5 space-y-3 font-mono text-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('selectedPlanLabel')}</span>
            <span className="text-foreground font-bold truncate max-w-[220px] text-right">
              {activePlanTitle}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('startDateLabel')}</span>
            <div className="bg-muted border border-border rounded-lg px-3 py-1 text-foreground font-bold flex items-center gap-2">
              <span>{startDateStr}</span>
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('expirationDateLabel')}</span>
            <span className="text-primary font-bold font-mono">{expirationDateStr}</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-muted-foreground">
              {t('calculatedFeeLabel')} ({durationMultiplier}{' '}
              {durationMultiplier === 1 ? (isMn ? 'Сар' : 'Month') : (isMn ? 'Сар' : 'Months')}):
            </span>
            <span className="text-base font-extrabold text-foreground font-mono">
              {formatCurrency(calculateRegistrationFee(activePlan, durationMultiplier))}
            </span>
          </div>
        </div>
      </Card>

      {/* 3. PAYMENT STATUS & METHOD */}
      <Card id="card-payment-status" className="p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground font-bold text-xs">
            <CreditCard className="w-4 h-4 text-primary" />
            <span>{t('paymentStatusTitle')}</span>
          </div>
          <Badge variant="success">
            {t('paymentReceivedBadge')}
          </Badge>
        </div>

        <div>
          <span className="block text-[9px] font-bold tracking-wider text-muted-foreground uppercase font-mono mb-2">
            {t('paymentMethodLabel')}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { key: 'Card', label: t('payCard') },
                { key: 'Cash', label: t('payCash') },
                { key: 'Transfer', label: t('payTransfer') },
              ] as const
            ).map(({ key, label }) => {
              const isMethodActive = paymentMethod === key;
              return (
                <button
                  key={key}
                  id={`payment-method-${key.toLowerCase()}`}
                  type="button"
                  onClick={() =>
                    form.setValue('paymentMethod', key, { shouldValidate: true })
                  }
                  className={cn(
                    'py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                    isMethodActive
                      ? 'bg-muted border border-primary text-primary shadow-xs'
                      : 'bg-input border border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
