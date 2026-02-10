import { z } from "zod";

export const productTypeSchema = z.object({
    category_id: z.number({
        required_error: "Category is required",
    }),
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    is_active: z.boolean().optional().default(true),
});
