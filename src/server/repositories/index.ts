export * from './types';
export * from './in-memory';

import {
  InMemoryMemberRepository,
  InMemoryPlanRepository,
  InMemoryLockerLogRepository,
  InMemoryLockerRepository,
  InMemoryStaffRepository,
  InMemoryMembershipTransactionRepository,
  InMemoryNutrientRepository,
  InMemoryNutrientSaleRepository,
  InMemorySupplierRepository,
  InMemoryPurchaseOrderRepository,
  InMemoryStockIntakeRepository,
} from './in-memory';

// Singleton instances for repository access
const memberRepository = new InMemoryMemberRepository();
const planRepository = new InMemoryPlanRepository();
const lockerLogRepository = new InMemoryLockerLogRepository();
const lockerRepository = new InMemoryLockerRepository();
const staffRepository = new InMemoryStaffRepository();
const transactionRepository = new InMemoryMembershipTransactionRepository();
const nutrientRepository = new InMemoryNutrientRepository();
const nutrientSaleRepository = new InMemoryNutrientSaleRepository();
const supplierRepository = new InMemorySupplierRepository();
const purchaseOrderRepository = new InMemoryPurchaseOrderRepository();
const stockIntakeRepository = new InMemoryStockIntakeRepository();

export const getMemberRepository = () => memberRepository;
export const getPlanRepository = () => planRepository;
export const getLockerLogRepository = () => lockerLogRepository;
export const getLockerRepository = () => lockerRepository;
export const getStaffRepository = () => staffRepository;
export const getMembershipTransactionRepository = () => transactionRepository;
export const getNutrientRepository = () => nutrientRepository;
export const getNutrientSaleRepository = () => nutrientSaleRepository;
export const getSupplierRepository = () => supplierRepository;
export const getPurchaseOrderRepository = () => purchaseOrderRepository;
export const getStockIntakeRepository = () => stockIntakeRepository;
