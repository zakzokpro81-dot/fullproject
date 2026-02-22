import { z } from "zod";

export const attributeOptionSchema = z.object({
    attribute_id: z.coerce.number().positive("Attribute is required"),
    value: z.string().min(1, "Value is required").trim(),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens").trim(),
});

export const attributeOptionDefaults = {
    attribute_id: "",
    value: "",
    slug: "",
};
