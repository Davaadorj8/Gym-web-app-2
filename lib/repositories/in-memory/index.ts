import {
  CrudRepository,
  IMemberRepository,
  IPlanRepository,
  ILockerLogRepository,
  IStaffRepository,
} from '../types';
import {
  GymMember,
  BuiltPlan,
  LockerLog,
  StaffAccount,
  MembershipExtensionLog,
  MOCK_GYM_MEMBERS,
  MOCK_BUILT_PLANS,
  MOCK_LOCKER_LOGS,
  MOCK_STAFF_ACCOUNTS,
} from '@/lib/types';

export class InMemoryRepository<T extends { id: string }> implements CrudRepository<T, string> {
  protected items: Map<string, T> = new Map();

  constructor(initialItems: T[] = []) {
    initialItems.forEach((item) => this.items.set(item.id, { ...item }));
  }

  async findAll(): Promise<T[]> {
    return Array.from(this.items.values());
  }

  async findById(id: string): Promise<T | null> {
    const item = this.items.get(id);
    return item ? { ...item } : null;
  }

  async create(item: T): Promise<T> {
    this.items.set(item.id, { ...item });
    return { ...item };
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const existing = this.items.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.items.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }
}

export class InMemoryMemberRepository
  extends InMemoryRepository<GymMember>
  implements IMemberRepository
{
  constructor() {
    super(MOCK_GYM_MEMBERS);
  }

  async findByPhoneOrEmail(query: string): Promise<GymMember | null> {
    const normalized = query.trim().toLowerCase();
    for (const member of this.items.values()) {
      if (
        (member.phone && member.phone.toLowerCase() === normalized) ||
        (member.email && member.email.toLowerCase() === normalized)
      ) {
        return { ...member };
      }
    }
    return null;
  }

  async findActiveMembers(): Promise<GymMember[]> {
    return Array.from(this.items.values()).filter((m) => m.status === 'Active');
  }

  async findMembersInGym(): Promise<GymMember[]> {
    return Array.from(this.items.values()).filter(
      (m) => m.occupancyStatus === 'Checked In'
    );
  }

  async addExtension(
    memberId: string,
    extension: MembershipExtensionLog
  ): Promise<GymMember | null> {
    const member = this.items.get(memberId);
    if (!member) return null;
    const history = member.extensionHistory ? [...member.extensionHistory] : [];
    history.push(extension);
    const updated: GymMember = {
      ...member,
      expirationDate: extension.newExpirationDate,
      status: 'Active',
      extensionHistory: history,
    };
    this.items.set(memberId, updated);
    return { ...updated };
  }

  async updateCheckInStatus(
    memberId: string,
    occupancyStatus: 'Checked In' | 'Checked Out',
    assignedLocker?: string | null
  ): Promise<GymMember | null> {
    const member = this.items.get(memberId);
    if (!member) return null;
    const updated: GymMember = {
      ...member,
      occupancyStatus,
      assignedLocker: assignedLocker !== undefined ? assignedLocker : member.assignedLocker,
      lastCheckInTime:
        occupancyStatus === 'Checked In' ? new Date().toISOString() : member.lastCheckInTime,
    };
    this.items.set(memberId, updated);
    return { ...updated };
  }
}

export class InMemoryPlanRepository
  extends InMemoryRepository<BuiltPlan>
  implements IPlanRepository
{
  constructor() {
    super(MOCK_BUILT_PLANS);
  }

  async findByCategory(category: string): Promise<BuiltPlan[]> {
    return Array.from(this.items.values()).filter(
      (p) => p.categoryTarget === category
    );
  }
}

export class InMemoryLockerLogRepository
  extends InMemoryRepository<LockerLog>
  implements ILockerLogRepository
{
  constructor() {
    super(MOCK_LOCKER_LOGS);
  }

  async findRecentLogs(limit = 50): Promise<LockerLog[]> {
    const logs = Array.from(this.items.values());
    logs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return logs.slice(0, limit);
  }

  async findLogsByMember(memberId: string): Promise<LockerLog[]> {
    return Array.from(this.items.values()).filter((l) => l.memberId === memberId);
  }
}

export class InMemoryStaffRepository
  extends InMemoryRepository<StaffAccount>
  implements IStaffRepository
{
  constructor() {
    super(MOCK_STAFF_ACCOUNTS);
  }

  async findByUsername(username: string): Promise<StaffAccount | null> {
    const normalized = username.trim().toLowerCase();
    for (const staff of this.items.values()) {
      if (staff.username.toLowerCase() === normalized) {
        return { ...staff };
      }
    }
    return null;
  }

  async findActiveStaff(): Promise<StaffAccount[]> {
    return Array.from(this.items.values()).filter((s) => s.status === 'Active');
  }
}

