import { z } from "zod";

export const CreateInvoiceSchema = z.object({
  memberId: z.string(),
  amount: z.number().positive(),
  description: z.string(),
  dueDate: z.string(),
});

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;

export interface PlanTier {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
}
