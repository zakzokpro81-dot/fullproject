import { z } from "zod";

export const supplierPaymentSchema = z.object({
  purchase_invoice_id: z.coerce.number().positive("Purchase invoice is required"),
  account_id: z.union([z.coerce.number().positive(), z.literal(""), z.literal(0)]).optional(),
  payment_date: z.string().min(1, "Payment date is required"),
  amount: z.coerce.number().min(0, "Amount must be 0 or more"),
  method: z.enum(["cash", "bank", "check"], { required_error: "Payment method is required" }),
  notes: z.string().optional().or(z.literal("")),
});

export const supplierPaymentDefaults = {
  purchase_invoice_id: "",
  account_id: "",
  payment_date: new Date().toISOString().split("T")[0],
  amount: 0,
  method: "cash",
  notes: "",
};
