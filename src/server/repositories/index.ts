export * from './types';
export * from './in-memory';

import {
  InMemoryMemberRepository,
  InMemoryPlanRepository,
  InMemoryMembershipTransactionRepository,
} from './in-memory';

// Singleton instances for repository access
const memberRepository = new InMemoryMemberRepository();
const planRepository = new InMemoryPlanRepository();
const transactionRepository = new InMemoryMembershipTransactionRepository();

export const getMemberRepository = () => memberRepository;
export const getPlanRepository = () => planRepository;
export const getMembershipTransactionRepository = () => transactionRepository;
