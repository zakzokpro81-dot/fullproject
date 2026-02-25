import { z } from "zod";

export const paymentSchema = z.object({
  invoice_id: z.coerce.number().min(1, "Please select an invoice"),
  account_id: z.coerce.number().min(1, "Please select an account"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  method: z.enum(["cash", "bank", "check"], { required_error: "Payment method is required" }),
  notes: z.string().optional().nullable(),
});

export const paymentDefaults = {
  invoice_id: "",
  account_id: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  method: "cash",
  notes: "",
};