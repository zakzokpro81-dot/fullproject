import { z } from "zod";

export const orderSchema = z.object({
  customer_id: z.number().min(1, "Please select a customer"),
  warehouse_id: z.number().min(1, "Please select a warehouse"),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      product_id: z.number().min(1, "Required"), // تأكد أنها product_id
      quantity: z.number().min(1, "Min 1"),
      notes: z.string().optional(),
    })
  ).nonempty("Order must have at least one item"),
});