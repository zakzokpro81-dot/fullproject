import { z } from "zod";

export const salesReturnSchema = z.object({
  invoice_id: z.coerce.number().positive("Invoice is required"),
  invoice_item_id: z.coerce.number().positive("Invoice item is required"),
  return_date: z.string().min(1, "Return date is required"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  reason: z.string().optional().or(z.literal("")),
  refund_amount: z.coerce.number().min(0, "Refund amount must be 0 or more"),
  status_id: z.coerce.number().positive("Status is required"),
});

export const salesReturnDefaults = {
  invoice_id: "",
  invoice_item_id: "",
  return_date: new Date().toISOString().split("T")[0],
  quantity: 1,
  reason: "",
  refund_amount: 0,
  status_id: 1,
};
