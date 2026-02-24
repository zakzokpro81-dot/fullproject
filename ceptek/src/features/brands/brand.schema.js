import { z } from "zod";

export const brandSchema = z.object({
  name: z
    .string()
    .min(2, "Brand name must be at least 2 characters")
    .trim(),

  slug: z
    .string()
    .min(2, "Slug is too short")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),

  is_active: z.boolean().default(true),
});

export const brandDefaults = {
  name: "",
  slug: "",
  is_active: true,
};
