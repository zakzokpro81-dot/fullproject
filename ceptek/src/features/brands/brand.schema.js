// 2️⃣ brand.schema.js

// 📌 قواعد التحقق (Validation)

// ما هو الشكل الصحيح للبيانات؟

// ما المطلوب؟

// ما الممنوع؟

// هذا الملف يجعل الفورم نظيف وما يخرب البيانات



import { z } from "zod";

export const brandSchema = z.object({
  name: z
    .string()
    .min(2, "اسم البراند يجب أن يكون على الأقل حرفين")
    .trim(),

  slug: z
    .string()
    .min(2, "Slug غير صالح")
    .regex(/^[a-z0-9-]+$/, "Slug يجب أن يحتوي على أحرف صغيرة وشرطات فقط"),

  is_active: z.boolean().default(true),
});

export const brandDefaults = {
  name: "",
  slug: "",
  is_active: true,
};
