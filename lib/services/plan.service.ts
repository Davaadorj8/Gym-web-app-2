import { BuiltPlan, CategoryTarget } from '@/lib/types';

export const DEFAULT_PLAN_FALLBACKS: Record<
  CategoryTarget,
  { titleEn: string; titleMn: string; defaultPrice: number; defaultMonths: number }
> = {
  over18: {
    titleEn: 'Adult Full Access Pass',
    titleMn: 'Насанд хүрэгчдийн бүрэн эрхт багц',
    defaultPrice: 150000,
    defaultMonths: 1,
  },
  under18: {
    titleEn: 'Under 18 Youth Pass',
    titleMn: '18-аас доош насны залуусын багц',
    defaultPrice: 100000,
    defaultMonths: 1,
  },
  organization: {
    titleEn: 'Corporate & Group Pass',
    titleMn: 'Байгууллага & хамт олны багц',
    defaultPrice: 300000,
    defaultMonths: 1,
  },
};

/**
 * Returns localized fallback title for a plan category.
 */
export function getDefaultPlanTitle(category: CategoryTarget, isMn: boolean = false): string {
  const fallback = DEFAULT_PLAN_FALLBACKS[category] || DEFAULT_PLAN_FALLBACKS.over18;
  return isMn ? fallback.titleMn : fallback.titleEn;
}

/**
 * Calculates total registration / renewal fee based on plan rate and multiplier.
 */
export function calculatePlanFee(
  plan: BuiltPlan | null | undefined,
  multiplier: number = 1
): { total: number; monthlyRate: number } {
  if (!plan) {
    return { total: 0, monthlyRate: 0 };
  }
  const monthlyRate = plan.price / (plan.durationMonths || 1);
  const total = Math.round(monthlyRate * multiplier);
  return { total, monthlyRate };
}

/**
 * Resolves category target cleanly from member entity attributes instead of fragile substring matching.
 */
export function resolveMemberCategory(member: {
  planCategory?: CategoryTarget;
  isOrganization?: boolean;
  planTitle?: string;
}): CategoryTarget {
  if (member.isOrganization || member.planCategory === 'organization') {
    return 'organization';
  }
  if (member.planCategory) {
    return member.planCategory;
  }
  const title = (member.planTitle || '').toLowerCase();
  if (title.includes('under 18') || title.includes('youth') || title.includes('junior')) {
    return 'under18';
  }
  if (title.includes('corporate') || title.includes('group') || title.includes('org')) {
    return 'organization';
  }
  return 'over18';
}
