import { z } from "zod";

export const invoiceSchema = z.object({
  customer_id: z.coerce.number().min(1, "Please select a customer"),
  invoice_date: z.string().min(1, "Date is required"),
  total_amount: z.coerce.number().min(0, "Total must be 0 or more"),
  status_id: z.coerce.number().min(1, "Please select a status"),
  paid_amount: z.coerce.number().default(0),
});