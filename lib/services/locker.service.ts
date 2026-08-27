import { GymMember } from '@/lib/types';

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
 * Finds the first available locker not in the occupied set.
 */
export function getNextAvailableLocker(
  totalLockers: number = DEFAULT_LOCKER_CAPACITY,
  occupiedLockers: Set<string>
): string {
  const list = generateLockerList(totalLockers);
  return list.find((loc) => !occupiedLockers.has(loc)) || formatLockerNumber(1);
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
  outOfServiceCount: number = 0
): LockerOccupancyMetrics {
  const effectiveTotal = Math.max(1, totalLockers || DEFAULT_LOCKER_CAPACITY);
  const availableCount = Math.max(0, effectiveTotal - occupiedCount - outOfServiceCount);
  const occupancyRate = Math.min(100, Math.round((occupiedCount / (effectiveTotal - outOfServiceCount)) * 100)) || 0;

  return {
    totalLockers: effectiveTotal,
    occupiedCount,
    availableCount,
    outOfServiceCount,
    occupancyRate,
  };
}
