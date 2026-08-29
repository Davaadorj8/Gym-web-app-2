export enum StaffPermission {
  MEMBER_CHECKIN = 'MEMBER_CHECKIN',
  MEMBER_EXTEND = 'MEMBER_EXTEND',
  MEMBER_DELETE = 'MEMBER_DELETE',
  MANAGE_LOCKERS = 'MANAGE_LOCKERS',
  MANAGE_INVENTORY = 'MANAGE_INVENTORY',
  PROCESS_REFUNDS = 'PROCESS_REFUNDS',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  MANAGE_STAFF = 'MANAGE_STAFF',
}

export type StaffRole =
  | 'ADMIN'
  | 'DESK_STAFF'
  | 'TRAINER'
  | 'INVENTORY_MANAGER'
  | 'Front Desk Staff'
  | 'Gym Trainer'
  | 'Shift Lead'
  | 'Assistant Manager'
  | 'admin'
  | 'staff';

export const ROLE_PERMISSIONS: Record<StaffRole, StaffPermission[]> = {
  ADMIN: Object.values(StaffPermission),
  admin: Object.values(StaffPermission),
  DESK_STAFF: [
    StaffPermission.MEMBER_CHECKIN,
    StaffPermission.MEMBER_EXTEND,
    StaffPermission.MANAGE_LOCKERS,
  ],
  'Front Desk Staff': [
    StaffPermission.MEMBER_CHECKIN,
    StaffPermission.MEMBER_EXTEND,
    StaffPermission.MANAGE_LOCKERS,
  ],
  'Shift Lead': [
    StaffPermission.MEMBER_CHECKIN,
    StaffPermission.MEMBER_EXTEND,
    StaffPermission.MANAGE_LOCKERS,
    StaffPermission.VIEW_ANALYTICS,
  ],
  'Assistant Manager': [
    StaffPermission.MEMBER_CHECKIN,
    StaffPermission.MEMBER_EXTEND,
    StaffPermission.MANAGE_LOCKERS,
    StaffPermission.VIEW_ANALYTICS,
    StaffPermission.MANAGE_STAFF,
  ],
  TRAINER: [StaffPermission.MEMBER_CHECKIN],
  'Gym Trainer': [StaffPermission.MEMBER_CHECKIN],
  INVENTORY_MANAGER: [StaffPermission.MANAGE_INVENTORY],
  staff: [
    StaffPermission.MEMBER_CHECKIN,
    StaffPermission.MEMBER_EXTEND,
    StaffPermission.MANAGE_LOCKERS,
  ],
};

export function hasStaffPermission(
  staffPermissions: StaffPermission[] | undefined,
  requiredPermission: StaffPermission
): boolean {
  return staffPermissions?.includes(requiredPermission) ?? false;
}
