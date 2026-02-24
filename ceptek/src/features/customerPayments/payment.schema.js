import { z } from "zod";

export const paymentSchema = z.object({
  invoice_id: z.coerce.number().min(1, "Please select an invoice"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional().nullable(),
});

export const paymentDefaults = {
  invoice_id: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  notes: "",
};