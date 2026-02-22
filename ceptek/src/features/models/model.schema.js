import { z } from "zod";

export const modelSchema = z.object({
  name: z.string().min(1, "Model name is required").trim(),
  brand: z.coerce.number().positive("Brand is required"),
  family: z.coerce.number().positive("Family is required"),
  slug: z.string().min(1, "Slug is required").trim(),
  is_active: z.boolean().default(true),
});

/**
 * Blank defaults — used as the single source of truth by ModelForm.
 * Using empty strings for FK fields so the select shows a placeholder.
 */
export const modelDefaults = {
  name: "",
  brand: "",
  family: "",
  slug: "",
  is_active: true,
};
