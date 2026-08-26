import { addMonths, format, parseISO, isValid } from 'date-fns';
import { GymMember, CategoryTarget, BuiltPlan, MembershipExtensionLog } from '@/lib/types';

/**
 * Calculates a new expiration date string (YYYY-MM-DD) given a base date and months to add.
 * Handles existing expiration dates past today vs expired dates.
 */
export function computeNewExpirationDate(currentExpDateStr?: string, monthsToAdd: number = 1): string {
  try {
    const today = new Date();
    let baseDate = today;

    if (currentExpDateStr) {
      const parsed = parseISO(currentExpDateStr);
      if (isValid(parsed) && parsed > today) {
        baseDate = parsed;
      }
    }

    const calculated = addMonths(baseDate, monthsToAdd);
    return format(calculated, 'yyyy-MM-dd');
  } catch {
    const fallback = addMonths(new Date(), monthsToAdd);
    return format(fallback, 'yyyy-MM-dd');
  }
}

/**
 * Calculates an extension fee for a given plan and duration added.
 */
export function calculateExtensionFee(
  plan: BuiltPlan | undefined | null,
  monthsAdded: number,
  fallbackMonthlyRate: number = 150000
): number {
  if (!plan || !plan.price) {
    return monthsAdded * fallbackMonthlyRate;
  }
  const monthlyRate = plan.price / (plan.durationMonths || 1);
  return Math.round(monthlyRate * monthsAdded);
}

export type MemberFilterTab = 'all' | 'active' | 'unpaid' | 'expired' | 'in-gym';

/**
 * Filters gym members by filter tab and search query across ID, full name, email, phone, and org.
 */
export function filterMembers(
  members: GymMember[],
  searchQuery: string = '',
  activeFilter: MemberFilterTab = 'all'
): GymMember[] {
  const trimmed = searchQuery.trim().toLowerCase();

  return members.filter((member) => {
    // 1. Tab Status Filter
    if (activeFilter === 'active' && member.status !== 'Active') return false;
    if (activeFilter === 'expired' && member.status !== 'Expired') return false;
    if (activeFilter === 'unpaid' && member.status !== 'Suspended') return false;
    if (activeFilter === 'in-gym' && member.occupancyStatus !== 'Checked In') return false;

    // 2. Search Query Filter
    if (!trimmed) return true;
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const idMatch = member.id.toLowerCase().includes(trimmed);
    const nameMatch = fullName.includes(trimmed);
    const emailMatch = (member.email || '').toLowerCase().includes(trimmed);
    const phoneMatch = (member.phone || '').toLowerCase().includes(trimmed);
    const orgMatch = (member.orgName || '').toLowerCase().includes(trimmed);
    const planMatch = (member.planTitle || '').toLowerCase().includes(trimmed);

    return idMatch || nameMatch || emailMatch || phoneMatch || orgMatch || planMatch;
  });
}
