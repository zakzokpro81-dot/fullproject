import { z } from "zod";

export const invoiceSchema = z.object({
  customer_id: z.coerce.number().min(1, "Customer is required"),
  warehouse_id: z.coerce.number().min(1, "Warehouse is required"),
  account_id: z.coerce.number().min(1, "Payment box is required"),
  product_id: z.coerce.number().min(1, "Product is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unit_price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  paid_amount: z.coerce.number().min(0, "Paid amount cannot be negative"),
});