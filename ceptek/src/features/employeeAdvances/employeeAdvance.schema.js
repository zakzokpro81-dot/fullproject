import { z } from "zod";

export const employeeAdvanceSchema = z.object({
  employee_id: z.coerce.number().positive("Employee is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  remaining_amount: z.coerce.number().min(0, "Remaining amount must be non-negative"),
  reason: z.string().optional().or(z.literal("")),
  status: z.enum(["pending", "approved", "repaid"]).default("pending"),
  account_id: z.coerce.number().positive("Account is required").optional().or(z.literal("")),
});

export const employeeAdvanceDefaults = {
  employee_id: "",
  amount: 0,
  remaining_amount: 0,
  reason: "",
  status: "pending",
  account_id: "",
};
