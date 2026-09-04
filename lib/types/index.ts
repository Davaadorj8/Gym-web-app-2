export * from './members.types';
export * from './staff.types';
export * from './lockers.types';
export * from './inventory.types';

import { MOCK_BUILT_PLANS, MOCK_GYM_MEMBERS } from './members.types';
import { MOCK_STAFF_ACCOUNTS } from './staff.types';
import { MOCK_LOCKER_LOGS } from './lockers.types';
import { MOCK_NUTRIENT_PRODUCTS, MOCK_NUTRIENT_SALES } from './inventory.types';

// Aliases for backward compatibility
export const DEFAULT_BUILT_PLANS = MOCK_BUILT_PLANS;
export const INITIAL_GYM_MEMBERS = MOCK_GYM_MEMBERS;
export const INITIAL_LOCKER_LOGS = MOCK_LOCKER_LOGS;
export const INITIAL_STAFF_ACCOUNTS = MOCK_STAFF_ACCOUNTS;
export const INITIAL_NUTRIENT_PRODUCTS = MOCK_NUTRIENT_PRODUCTS;
export const INITIAL_NUTRIENT_SALES = MOCK_NUTRIENT_SALES;
