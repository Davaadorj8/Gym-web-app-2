export * from './types';
export * from './in-memory';

import {
  InMemoryMemberRepository,
  InMemoryPlanRepository,
  InMemoryLockerLogRepository,
  InMemoryLockerRepository,
  InMemoryStaffRepository,
  InMemoryMembershipTransactionRepository,
} from './in-memory';

// Singleton instances for repository access
const memberRepository = new InMemoryMemberRepository();
const planRepository = new InMemoryPlanRepository();
const lockerLogRepository = new InMemoryLockerLogRepository();
const lockerRepository = new InMemoryLockerRepository();
const staffRepository = new InMemoryStaffRepository();
const transactionRepository = new InMemoryMembershipTransactionRepository();

export const getMemberRepository = () => memberRepository;
export const getPlanRepository = () => planRepository;
export const getLockerLogRepository = () => lockerLogRepository;
export const getLockerRepository = () => lockerRepository;
export const getStaffRepository = () => staffRepository;
export const getMembershipTransactionRepository = () => transactionRepository;
