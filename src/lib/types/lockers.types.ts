import { UserRole } from './staff.types';

// Default physical locker count and display prefix for a location that hasn't
// configured its own capacity yet. Lives here (not in a service file) so both
// the pure lib/services helpers and the server/repositories layer can use it
// without server code importing from lib/services.
export const DEFAULT_LOCKER_CAPACITY = 60;
export const LOCKER_PREFIX = 'Locker #';

export type LockerCustomStatus =
  | 'available'
  | 'occupied'
  | 'clean'
  | 'repair'
  | 'key_lost'
  | 'key_not_returned'
  | 'inactive';

export interface LockerStatusDetail {
  id: string;
  lockerNumber: string;
  tenantId?: string;
  locationId?: string;
  status: LockerCustomStatus;
  updatedAt: string;
  notes?: string;
  updatedBy?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface LockerLog {
  id: string;
  tenantId?: string;
  locationId?: string;
  lockerNumber: string;
  memberId: string;
  memberName: string;
  eventType: 'Checked In' | 'Checked Out';
  eventDescription: string;
  timestamp: string;
  timeFormatted: string;
  statusLabel: 'Check-In Logged' | 'Key Returned';
  staffLogged: string;
  staffRole?: UserRole;
  checkedInByStaffId?: string;
}

export interface WaitlistEntry {
  id: string;
  tenantId?: string;
  locationId?: string;
  resourceType: 'LOCKER' | 'GYM_FLOOR';
  memberId: string;
  memberName: string;
  joinedAt: string;
  status: 'WAITING' | 'OFFERED' | 'CLAIMED' | 'EXPIRED';
  offerExpiresAt?: string;
  offeredLockerNumber?: string;
}

export const MOCK_LOCKER_LOGS: LockerLog[] = [];
