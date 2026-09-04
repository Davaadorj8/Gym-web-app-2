import { AuthUser, StaffAccount, UserRole, STAFF_PERMISSION_OPTIONS } from '@/lib/types';

export const STAFF_SHIFTS = [
  { id: 'morning', labelEn: 'Morning (06:00 - 14:00)', labelMn: 'Өглөөний ээлж (06:00 - 14:00)' },
  { id: 'afternoon', labelEn: 'Afternoon (14:00 - 22:00)', labelMn: 'Өдрийн ээлж (14:00 - 22:00)' },
  { id: 'night', labelEn: 'Full Day / Flex (08:00 - 20:00)', labelMn: 'Бүтэн өдөр / Уян хатан (08:00 - 20:00)' },
] as const;

export const STAFF_ROLES = [
  'Front Desk Staff',
  'Gym Trainer',
  'Shift Lead',
  'Assistant Manager',
] as const;

export const DEFAULT_STAFF_PERMISSIONS = [
  'Check-In & Locker Desk',
  'Member Registration',
  'Directory & Extensions',
  'Inventory Management',
  'Analytics Viewing',
  'Check-In Desk',
  'Locker Usage & Logs',
  'Athlete & Org Registration',
  'Member Directory & Plan Extension',
  'Inventory View (Read-Only)',
  'Operational Analytics (Revenue Redacted)',
];

/**
 * Checks whether an authenticated user has permission to access a feature or view.
 */
export function hasStaffPermission(user: AuthUser | undefined | null, permissionKey: string): boolean {
  // Safe default during initial render/session hydration
  if (!user) return true;
  if (user.role === 'admin') return true;

  // Staff members default to standard operational permissions if not explicitly restricted
  const perms = user.permissions && user.permissions.length > 0
    ? user.permissions
    : DEFAULT_STAFF_PERMISSIONS;

  const keyLower = permissionKey.toLowerCase().trim();

  return perms.some((p) => {
    const lower = p.toLowerCase().trim();
    if (lower === keyLower) return true;

    if (keyLower === 'checkin-desk' || keyLower === 'checkin') {
      return lower.includes('check') || lower.includes('desk');
    }
    if (keyLower === 'locker') {
      return lower.includes('locker') || lower.includes('check');
    }
    if (keyLower === 'registration') {
      return lower.includes('reg') || lower.includes('athlete');
    }
    if (keyLower === 'directory') {
      return lower.includes('dir') || lower.includes('member') || lower.includes('ext');
    }
    if (keyLower === 'inventory') {
      return false;
    }
    if (keyLower === 'analytics' || keyLower === 'dashboard') {
      return lower.includes('ana') || lower.includes('dash') || lower.includes('stat');
    }
    return false;
  });
}
