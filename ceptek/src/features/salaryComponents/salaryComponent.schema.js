import { z } from "zod";

export const salaryComponentSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  type: z.enum(["allowance", "deduction"], { required_error: "Type is required" }),
  is_active: z.boolean().default(true),
});

export const salaryComponentDefaults = {
  name: "",
  type: "allowance",
  is_active: true,
};
