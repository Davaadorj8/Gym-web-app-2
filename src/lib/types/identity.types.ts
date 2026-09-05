// Core identity concepts shared across domains — who is acting (UserRole) and the
// session-facing user shape (AuthUser). Kept here (not in a specific domain's types)
// because multiple domains (e.g. lockers logging who checked a member in, staff
// accounts, auth sessions) need to reference "who acted" without depending on any one
// domain's internals.
export type UserRole = 'admin' | 'staff';

export interface AuthUser {
  id: string;
  tenantId?: string;
  locationId?: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  badge: string;
  email: string;
  permissions?: string[];
}
