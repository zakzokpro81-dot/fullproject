import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(2, "Account name is required").trim(),
  account_type: z.string().min(1, "Please select account type"),
  balance: z.coerce.number().default(0),
  is_active: z.boolean().optional().default(true),
});

export const accountDefaults = accountSchema.parse({
  name: "New Account",
  account_type: "cash",
  balance: 0,
  is_active: true,
});