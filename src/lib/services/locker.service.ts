import { GymMember, LockerCustomStatus } from '@/lib/types';

export const DEFAULT_LOCKER_CAPACITY = 60;
export const LOCKER_PREFIX = 'Locker #';

/**
 * Formats a locker index (1-based) into a standard formatted string, e.g. "Locker #01".
 */
export function formatLockerNumber(index: number, prefix: string = LOCKER_PREFIX): string {
  return `${prefix}${String(index).padStart(2, '0')}`;
}

/**
 * Generates an array of sequential formatted locker IDs based on capacity.
 */
export function generateLockerList(
  totalLockers: number = DEFAULT_LOCKER_CAPACITY,
  prefix: string = LOCKER_PREFIX
): string[] {
  const count = Math.max(1, totalLockers || DEFAULT_LOCKER_CAPACITY);
  const list: string[] = [];
  for (let i = 1; i <= count; i++) {
    list.push(formatLockerNumber(i, prefix));
  }
  return list;
}

/**
 * Returns a Set of assigned lockers for currently checked-in members.
 */
export function getOccupiedLockers(members: GymMember[]): Set<string> {
  const occupied = new Set<string>();
  members.forEach((m) => {
    if (m.occupancyStatus === 'Checked In' && m.assignedLocker) {
      occupied.add(m.assignedLocker);
    }
  });
  return occupied;
}

/**
 * Checks if a locker status code represents an out of service / unavailable state.
 */
export function isLockerUnavailableStatus(status?: LockerCustomStatus): boolean {
  if (!status) return false;
  return ['clean', 'repair', 'key_lost', 'key_not_returned', 'inactive'].includes(status);
}

/**
 * Counts lockers that are marked out of service / maintenance / cleaning / key lost.
 */
export function countOutOfServiceLockers(
  totalLockers: number = DEFAULT_LOCKER_CAPACITY,
  lockerStatuses?: Record<string, LockerCustomStatus>
): number {
  if (!lockerStatuses) return 0;
  const list = generateLockerList(totalLockers);
  let count = 0;
  list.forEach((loc) => {
    const st = lockerStatuses[loc];
    if (isLockerUnavailableStatus(st)) {
      count++;
    }
  });
  return count;
}

/**
 * Finds the first available locker not in the occupied set and not out of service.
 */
export function getNextAvailableLocker(
  totalLockers: number = DEFAULT_LOCKER_CAPACITY,
  occupiedLockers: Set<string>,
  lockerStatuses?: Record<string, LockerCustomStatus>
): string {
  const list = generateLockerList(totalLockers);
  const firstAvailable = list.find((loc) => {
    if (occupiedLockers.has(loc)) return false;
    if (lockerStatuses) {
      const st = lockerStatuses[loc];
      if (isLockerUnavailableStatus(st)) return false;
    }
    return true;
  });
  return firstAvailable || formatLockerNumber(1);
}

export interface LockerOccupancyMetrics {
  totalLockers: number;
  occupiedCount: number;
  availableCount: number;
  outOfServiceCount: number;
  occupancyRate: number;
}

/**
 * Calculates current locker occupancy rate, available count, and totals.
 */
export function calculateOccupancyMetrics(
  totalLockers: number = DEFAULT_LOCKER_CAPACITY,
  occupiedCount: number,
  outOfServiceOrStatuses?: number | Record<string, LockerCustomStatus>
): LockerOccupancyMetrics {
  const effectiveTotal = Math.max(1, totalLockers || DEFAULT_LOCKER_CAPACITY);
  
  let outOfServiceCount = 0;
  if (typeof outOfServiceOrStatuses === 'number') {
    outOfServiceCount = outOfServiceOrStatuses;
  } else if (outOfServiceOrStatuses && typeof outOfServiceOrStatuses === 'object') {
    outOfServiceCount = countOutOfServiceLockers(effectiveTotal, outOfServiceOrStatuses);
  }

  const availableCount = Math.max(0, effectiveTotal - occupiedCount - outOfServiceCount);
  const denominator = Math.max(1, effectiveTotal - outOfServiceCount);
  const occupancyRate = Math.min(100, Math.round((occupiedCount / denominator) * 100)) || 0;

  return {
    totalLockers: effectiveTotal,
    occupiedCount,
    availableCount,
    outOfServiceCount,
    occupancyRate,
  };
}

