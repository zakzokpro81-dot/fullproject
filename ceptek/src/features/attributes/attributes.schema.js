import { z } from "zod";

export const attributeSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  slug: z.string().min(1, "Slug is required").trim(),
  data_type: z.enum(["text", "number", "boolean"]),
  has_options: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const attributeDefaults = {
  name: "",
  slug: "",
  data_type: "text",
  has_options: false,
  is_active: true,
};
