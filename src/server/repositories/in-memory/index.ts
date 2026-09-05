import { InMemoryRepository } from './base';
import {
  IMemberRepository,
  IPlanRepository,
  IMembershipTransactionRepository,
  TenantQueryContext,
} from '../types';
import {
  GymMember,
  BuiltPlan,
  MembershipExtensionLog,
  MembershipTransaction,
  MOCK_GYM_MEMBERS,
  MOCK_BUILT_PLANS,
} from '@/lib/types';

export { InMemoryRepository };

export class InMemoryMemberRepository
  extends InMemoryRepository<GymMember>
  implements IMemberRepository
{
  constructor() {
    super(MOCK_GYM_MEMBERS);
  }

  async findByPhoneOrEmail(ctxOrQuery: TenantQueryContext | string, query?: string): Promise<GymMember | null> {
    const ctx = typeof ctxOrQuery === 'object' ? ctxOrQuery : undefined;
    const actualQuery = typeof ctxOrQuery === 'string' ? ctxOrQuery : query!;
    const normalized = actualQuery.trim().toLowerCase();
    for (const member of this.items.values()) {
      if (member.deletedAt) continue;
      if (!this.matchesTenant(member, ctx)) continue;
      if (
        (member.phone && member.phone.toLowerCase() === normalized) ||
        (member.email && member.email.toLowerCase() === normalized)
      ) {
        return { ...member };
      }
    }
    return null;
  }

  async findActiveMembers(ctx?: TenantQueryContext): Promise<GymMember[]> {
    return Array.from(this.items.values()).filter(
      (m) => m.status === 'Active' && !m.deletedAt && this.matchesTenant(m, ctx)
    );
  }

  async findMembersInGym(ctx?: TenantQueryContext): Promise<GymMember[]> {
    return Array.from(this.items.values()).filter(
      (m) => m.occupancyStatus === 'Checked In' && !m.deletedAt && this.matchesTenant(m, ctx)
    );
  }

  async addExtension(
    ctxOrMemberId: TenantQueryContext | string,
    memberIdOrExtension: string | MembershipExtensionLog,
    extension?: MembershipExtensionLog
  ): Promise<GymMember | null> {
    const ctx = typeof ctxOrMemberId === 'object' ? ctxOrMemberId : undefined;
    const memberId = typeof ctxOrMemberId === 'string' ? ctxOrMemberId : (memberIdOrExtension as string);
    const ext = typeof ctxOrMemberId === 'string' ? (memberIdOrExtension as MembershipExtensionLog) : extension!;
    const member = this.items.get(memberId);
    if (!member || member.deletedAt || !this.matchesTenant(member, ctx)) return null;
    const history = member.extensionHistory ? [...member.extensionHistory] : [];
    history.push(ext);
    const updated: GymMember = {
      ...member,
      expirationDate: ext.newExpirationDate,
      status: 'Active',
      extensionHistory: history,
    };
    this.items.set(memberId, updated);
    return { ...updated };
  }

  async updateCheckInStatus(
    ctxOrMemberId: TenantQueryContext | string,
    memberIdOrStatus: string | 'Checked In' | 'Checked Out',
    occupancyStatusOrLocker?: 'Checked In' | 'Checked Out' | string | null,
    assignedLocker?: string | null
  ): Promise<GymMember | null> {
    const ctx = typeof ctxOrMemberId === 'object' ? ctxOrMemberId : undefined;
    const memberId = typeof ctxOrMemberId === 'string' ? ctxOrMemberId : (memberIdOrStatus as string);
    const occupancyStatus = typeof ctxOrMemberId === 'string'
      ? (memberIdOrStatus as 'Checked In' | 'Checked Out')
      : (occupancyStatusOrLocker as 'Checked In' | 'Checked Out');
    const locker = typeof ctxOrMemberId === 'string'
      ? (occupancyStatusOrLocker as string | null)
      : assignedLocker;

    const member = this.items.get(memberId);
    if (!member || member.deletedAt || !this.matchesTenant(member, ctx)) return null;
    const updated: GymMember = {
      ...member,
      occupancyStatus,
      assignedLocker: locker !== undefined ? locker : member.assignedLocker,
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

  async findByCategory(ctxOrCategory: TenantQueryContext | string, category?: string): Promise<BuiltPlan[]> {
    const ctx = typeof ctxOrCategory === 'object' ? ctxOrCategory : undefined;
    const cat = typeof ctxOrCategory === 'string' ? ctxOrCategory : category!;
    return Array.from(this.items.values()).filter(
      (p) => p.categoryTarget === cat && this.matchesTenant(p, ctx)
    );
  }
}

export class InMemoryMembershipTransactionRepository
  extends InMemoryRepository<MembershipTransaction>
  implements IMembershipTransactionRepository
{
  constructor() {
    super([]);
  }

  async findByMemberId(ctxOrMemberId: TenantQueryContext | string, memberId?: string): Promise<MembershipTransaction[]> {
    const ctx = typeof ctxOrMemberId === 'object' ? ctxOrMemberId : undefined;
    const targetMemberId = typeof ctxOrMemberId === 'string' ? ctxOrMemberId : memberId!;
    return Array.from(this.items.values()).filter(
      (tx) => tx.memberId === targetMemberId && this.matchesTenant(tx, ctx)
    );
  }
}
