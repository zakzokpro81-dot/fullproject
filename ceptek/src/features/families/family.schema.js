//Zod schema لتعريف شكل البيانات المطلوبة للفورم (validation).
// family.schema.js
// Zod schema للفورم الخاص بـ Families
// يتحقق من صحة البيانات قبل الإرسال


import { z } from "zod";

export const familySchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.number({
    required_error: "Brand is required",
    invalid_type_error: "Brand must be a number",
  }),
  category: z.number({
    required_error: "Category is required",
    invalid_type_error: "Category must be a number",
  }),
  slug: z.string().min(1, "Slug is required"),
  is_active: z.boolean().optional(),
});
