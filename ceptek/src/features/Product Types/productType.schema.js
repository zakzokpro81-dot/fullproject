import { z } from "zod";

export const productTypeSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  slug: z.string().min(1, "Slug is required").trim(),
  category_id: z.coerce.number().positive("Category is required"),
  variant_strategy_id: z.coerce.number().positive("Product structure is required"),
  tracking_type_id: z.coerce.number().positive("Tracking type is required"),
  is_active: z.boolean().default(true),
});

export const productTypeDefaults = {
  name: "",
  slug: "",
  category_id: "",
  variant_strategy_id: "",
  tracking_type_id: "",
  is_active: true,
};

