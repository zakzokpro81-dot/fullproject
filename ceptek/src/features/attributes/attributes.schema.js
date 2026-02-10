import { z } from "zod";

export const attributeSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required"),

  slug: z
    .string()
    .min(1, "Slug is required"),

  data_type: z
    .string()
    .min(1, "Data type is required"),

  has_options: z.boolean(),

  is_active: z.boolean(),
});
