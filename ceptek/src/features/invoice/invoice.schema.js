import { z } from "zod";

export const invoiceSchema = z.object({
  customer_id: z.coerce.number(),
  warehouse_id: z.coerce.number(),
  account_id: z.coerce.number(),
  paid_amount: z.coerce.number().default(0),
  items: z.array(z.object({
    product_id: z.number(),
    product_name: z.string(),
    quantity: z.coerce.number().min(1),
    unit_price: z.coerce.number(),
    total: z.coerce.number()
  })).min(1)
});