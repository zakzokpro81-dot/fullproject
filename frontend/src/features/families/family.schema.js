//Zod schema لتعريف شكل البيانات المطلوبة للفورم (validation).

// family.schema.js
// Zod schema للفورم الخاص بـ Families
// يتحقق من صحة البيانات قبل الإرسال
// src/features/families/family.schema.js

import { z } from "zod";

export const familySchema = z.object({
  name: z.string().min(1, "Family name is required"),
  slug: z.string().min(1, "Slug is required"),
  brand: z.number({ invalid_type_error: "Brand is required" }),
  category: z.number({ invalid_type_error: "Category is required" }),
  is_active: z.boolean(),
});
