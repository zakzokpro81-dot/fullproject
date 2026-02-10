import { z } from "zod";

export const attributeOptionSchema = z.object({
    attribute_id: z.number().int().positive(),
    value: z.string().min(1),
    slug: z.string().min(1),
});
