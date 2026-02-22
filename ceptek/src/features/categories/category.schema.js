import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  slug: z.string().min(1, "Slug is required").trim(),
  is_active: z.boolean().optional().default(true),
  show_all_models: z.boolean().optional().default(true),
});

// Defaults derived from the schema (single source of truth)
export const categoryDefaults = categorySchema.parse({
  // Provide minimal valid values so parse() succeeds
  name: "New Category",
  slug: "new-category",
  is_active: true,
  show_all_models: true,
});
