import { UserRole } from './staff.types';

export type LockerCustomStatus =
  | 'available'
  | 'occupied'
  | 'clean'
  | 'repair'
  | 'key_lost'
  | 'key_not_returned'
  | 'inactive';

export interface LockerStatusDetail {
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
