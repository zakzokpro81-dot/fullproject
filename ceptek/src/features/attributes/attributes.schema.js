import { z } from "zod";

export const attributeSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  slug: z.string().min(1, "Slug is required").trim(),
  data_type: z.enum(["text", "number", "boolean"]),
  has_options: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

/**
 * Generates a blank object with all schema defaults applied.
 */
export const attributeDefaults = attributeSchema.partial().parse({});
