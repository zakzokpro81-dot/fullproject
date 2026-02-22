// family.schema.js
// Zod schema للفورم الخاص بـ Families

import { z } from "zod";

export const familySchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  slug: z.string().min(1, "Slug is required").trim(),
  brand: z.coerce.number().positive("Brand is required"),
  product_type_id: z.coerce.number().positive("Product type is required"),
  is_active: z.boolean().default(true),
});

/**
 * Blank form state — single source of truth for all default values.
 * Used by FamilyForm so defaults stay in sync with the schema.
 */
export const familyDefaults = {
  name: "",
  slug: "",
  brand: "",
  product_type_id: "",
  is_active: true,
};
