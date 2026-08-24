"use server";

import { createSafeAction } from "@/lib/actions/safeAction";
import { CreateInvoiceSchema } from "../types";

export const generateInvoiceAction = createSafeAction(
  CreateInvoiceSchema,
  async (input) => {
    return {
      invoiceId: `INV-${Date.now()}`,
      status: "issued",
      ...input,
    };
  }
);
