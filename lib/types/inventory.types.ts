export type NutrientCategory = 'Supplements' | 'Shakes' | 'Beverages' | 'Snacks' | 'Vitamins';

export interface NutrientProduct {
  id: string;
  tenantId?: string;
  locationId?: string;
  name: string;
  category: NutrientCategory;
  price: number;
  stock: number;
  servingSize?: string;
  flavor?: string;
  bestBeforeDate?: string;
}

export interface NutrientSaleLog {
  id: string;
  tenantId?: string;
  locationId?: string;
  productId: string;
  productName: string;
  category: NutrientCategory;
  quantity: number;
  unitPrice: number;
  unitPriceAtSale?: number;
  totalPrice: number;
  timestamp: string;
  timeFormatted: string;
  paymentMethod: string;
  memberId?: string;
  memberName?: string;
  buyerName?: string;
  staffLogged?: string;
  staffName?: string;
}

export interface Supplier {
  id: string;
  tenantId?: string;
  locationId?: string;
  name: string;
  contactEmail: string;
  phone: string;
  leadTimeDays: number;
}

export interface POItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPurchaseCost: number;
}

export interface PurchaseOrder {
  id: string;
  tenantId?: string;
  locationId?: string;
  supplierId: string;
  supplierName: string;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  items: POItem[];
  totalCost: number;
  createdAt: string;
  receivedAt?: string;
}

export interface StockIntakeLog {
  id: string;
  tenantId?: string;
  locationId?: string;
  purchaseOrderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPurchaseCost: number;
  unitSellingPrice: number;
  marginPercent: number;
  timestamp: string;
}

export const MOCK_NUTRIENT_PRODUCTS: NutrientProduct[] = [
  { id: 'nutr-1', tenantId: 'tenant-arche', locationId: 'loc-downtown', name: 'Whey Isolate Protein (1kg)', category: 'Supplements', price: 145000, stock: 24, flavor: 'Chocolate Fudge', bestBeforeDate: '2027-02-28' },
  { id: 'nutr-2', tenantId: 'tenant-arche', locationId: 'loc-downtown', name: 'Pre-Workout Energy Blast', category: 'Supplements', price: 85000, stock: 15, flavor: 'Blue Raspberry', bestBeforeDate: '2026-09-12' },
  { id: 'nutr-3', tenantId: 'tenant-arche', locationId: 'loc-uptown', name: 'Post-Workout Recovery Shake', category: 'Shakes', price: 15000, stock: 40, flavor: 'Vanilla Cream', bestBeforeDate: '2026-08-15' },
  { id: 'nutr-4', tenantId: 'tenant-arche', locationId: 'loc-uptown', name: 'BCAA Electrolyte Powder', category: 'Beverages', price: 65000, stock: 18, flavor: 'Watermelon', bestBeforeDate: '2026-12-31' },
  { id: 'nutr-5', tenantId: 'tenant-arche', locationId: 'loc-westside', name: 'High Protein Bar (Box of 12)', category: 'Snacks', price: 48000, stock: 30, flavor: 'Peanut Butter', bestBeforeDate: '2026-09-02' },
  { id: 'nutr-6', tenantId: 'tenant-arche', locationId: 'loc-westside', name: 'Daily Multivitamin & Omega-3 Pack', category: 'Vitamins', price: 55000, stock: 12, bestBeforeDate: '2027-08-15' },
];

export const MOCK_NUTRIENT_SALES: NutrientSaleLog[] = [
  {
    id: 'sale-1',
    tenantId: 'tenant-arche',
    locationId: 'loc-downtown',
    productId: 'nutr-1',
    productName: 'Whey Isolate Protein (1kg)',
    category: 'Supplements',
    quantity: 2,
    unitPrice: 135000,
    totalPrice: 270000,
    timestamp: '2026-08-10T10:30:00.000Z',
    timeFormatted: '2026-08-10 10:30',
    paymentMethod: 'Card',
    memberName: 'Bataa Bold',
    staffLogged: 'Admin',
  },
  {
    id: 'sale-2',
    tenantId: 'tenant-arche',
    locationId: 'loc-uptown',
    productId: 'nutr-2',
    productName: 'Pre-Workout Energy Blast',
    category: 'Supplements',
    quantity: 1,
    unitPrice: 80000,
    totalPrice: 80000,
    timestamp: '2026-08-15T14:15:00.000Z',
    timeFormatted: '2026-08-15 14:15',
    paymentMethod: 'QPay',
    memberName: 'Tuya Ganbaatar',
    staffLogged: 'Front Desk Staff',
  },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'Elite Nutrition LLC', contactEmail: 'orders@elitenutrition.mn', phone: '9911-2233', leadTimeDays: 3 },
  { id: 'sup-2', name: 'BioTech Organics', contactEmail: 'info@biotech.mn', phone: '9922-3344', leadTimeDays: 5 },
  { id: 'sup-3', name: 'Peak Performance Suppliers', contactEmail: 'supply@peakperf.mn', phone: '8811-0022', leadTimeDays: 2 },
];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1001',
    supplierId: 'sup-1',
    supplierName: 'Elite Nutrition LLC',
    status: 'RECEIVED',
    items: [
      { id: 'poi-1', productId: 'nutr-1', productName: 'Whey Isolate Protein (1kg)', quantity: 20, unitPurchaseCost: 95000 }
    ],
    totalCost: 1900000,
    createdAt: '2026-08-01T10:00:00.000Z',
    receivedAt: '2026-08-04T14:30:00.000Z'
  },
  {
    id: 'po-1002',
    supplierId: 'sup-2',
    supplierName: 'BioTech Organics',
    status: 'ORDERED',
    items: [
      { id: 'poi-2', productId: 'nutr-2', productName: 'Pre-Workout Energy Blast', quantity: 15, unitPurchaseCost: 55000 }
    ],
    totalCost: 825000,
    createdAt: '2026-08-25T09:00:00.000Z'
  }
];

export const MOCK_STOCK_INTAKES: StockIntakeLog[] = [
  {
    id: 'intake-1',
    purchaseOrderId: 'po-1001',
    productId: 'nutr-1',
    productName: 'Whey Isolate Protein (1kg)',
    quantity: 20,
    unitPurchaseCost: 95000,
    unitSellingPrice: 145000,
    marginPercent: 34.48,
    timestamp: '2026-08-04T14:30:00.000Z'
  }
];
