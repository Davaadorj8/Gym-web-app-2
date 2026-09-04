import { z } from "zod";
import type {
  NutrientProduct,
  NutrientSaleLog,
  Supplier,
  PurchaseOrder,
  StockIntakeLog,
} from "@/lib/types";

const TenantContextSchema = z.object({
  tenantId: z.string().min(1),
  locationId: z.string().optional(),
});

export const NutrientCategorySchema = z.enum([
  "Supplements",
  "Shakes",
  "Beverages",
  "Snacks",
  "Vitamins",
]);

export const AddNutrientSchema = TenantContextSchema.extend({
  name: z.string().min(1),
  category: NutrientCategorySchema,
  price: z.number().min(0),
  stock: z.number().min(0),
  servingSize: z.string().optional(),
  flavor: z.string().optional(),
  bestBeforeDate: z.string().optional(),
});

export const UpdateNutrientSchema = TenantContextSchema.extend({
  id: z.string().min(1),
  name: z.string().min(1),
  category: NutrientCategorySchema,
  price: z.number().min(0),
  stock: z.number().min(0),
  servingSize: z.string().optional(),
  flavor: z.string().optional(),
  bestBeforeDate: z.string().optional(),
});

export const DeleteNutrientSchema = TenantContextSchema.extend({
  id: z.string().min(1),
});

export const UpdateNutrientPriceSchema = TenantContextSchema.extend({
  id: z.string().min(1),
  price: z.number().min(0),
});

export const RecordNutrientSaleSchema = TenantContextSchema.extend({
  productId: z.string().min(1),
  productName: z.string().min(1),
  category: NutrientCategorySchema,
  quantity: z.number().int().positive(),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  paymentMethod: z.string().min(1),
  memberId: z.string().optional(),
  memberName: z.string().optional(),
  buyerName: z.string().optional(),
  staffLogged: z.string().optional(),
  staffName: z.string().optional(),
});

export type AddNutrientInput = z.infer<typeof AddNutrientSchema>;
export type UpdateNutrientInput = z.infer<typeof UpdateNutrientSchema>;
export type DeleteNutrientInput = z.infer<typeof DeleteNutrientSchema>;
export type UpdateNutrientPriceInput = z.infer<typeof UpdateNutrientPriceSchema>;
export type RecordNutrientSaleInput = z.infer<typeof RecordNutrientSaleSchema>;

export const AddSupplierSchema = TenantContextSchema.extend({
  name: z.string().min(1),
  contactEmail: z.string().email(),
  phone: z.string().min(1),
  leadTimeDays: z.number().int().min(0),
});

export const UpdateSupplierSchema = TenantContextSchema.extend({
  id: z.string().min(1),
  name: z.string().min(1),
  contactEmail: z.string().email(),
  phone: z.string().min(1),
  leadTimeDays: z.number().int().min(0),
});

export const DeleteSupplierSchema = TenantContextSchema.extend({
  id: z.string().min(1),
});

export const POItemInputSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPurchaseCost: z.number().min(0),
});

export const CreatePurchaseOrderSchema = TenantContextSchema.extend({
  supplierId: z.string().min(1),
  supplierName: z.string().min(1),
  items: z.array(POItemInputSchema).min(1),
});

export const ReceivePurchaseOrderSchema = TenantContextSchema.extend({
  poId: z.string().min(1),
});

export const CancelPurchaseOrderSchema = TenantContextSchema.extend({
  poId: z.string().min(1),
});

export type AddSupplierInput = z.infer<typeof AddSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof UpdateSupplierSchema>;
export type DeleteSupplierInput = z.infer<typeof DeleteSupplierSchema>;
export type CreatePurchaseOrderInput = z.infer<typeof CreatePurchaseOrderSchema>;
export type ReceivePurchaseOrderInput = z.infer<typeof ReceivePurchaseOrderSchema>;
export type CancelPurchaseOrderInput = z.infer<typeof CancelPurchaseOrderSchema>;

export type { NutrientProduct, NutrientSaleLog, Supplier, PurchaseOrder, StockIntakeLog };
