import { CrudRepository } from '../types';
import {
  GymMember,
  BuiltPlan,
  LockerLog,
  StaffAccount,
  INITIAL_GYM_MEMBERS,
  DEFAULT_BUILT_PLANS,
  INITIAL_LOCKER_LOGS,
  INITIAL_STAFF_ACCOUNTS,
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

export class InMemoryMemberRepository extends InMemoryRepository<GymMember> {
  constructor() {
    super(INITIAL_GYM_MEMBERS);
  }
}

export class InMemoryPlanRepository extends InMemoryRepository<BuiltPlan> {
  constructor() {
    super(DEFAULT_BUILT_PLANS);
  }
}

export class InMemoryLockerLogRepository extends InMemoryRepository<LockerLog> {
  constructor() {
    super(INITIAL_LOCKER_LOGS);
  }
}

export class InMemoryStaffRepository extends InMemoryRepository<StaffAccount> {
  constructor() {
    super(INITIAL_STAFF_ACCOUNTS);
  }
}
