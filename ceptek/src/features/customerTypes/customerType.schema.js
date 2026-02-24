import { z } from "zod";

export const customerTypeSchema = z.object({
  type_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long")
    .trim(),
});

export const customerTypeDefaults = customerTypeSchema.parse({
  type_name: "New Type",
});