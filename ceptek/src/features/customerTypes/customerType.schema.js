import { z } from "zod";

export const customerTypeSchema = z.object({
  type_name: z
    .string()
    .min(2, "الاسم يجب أن يكون أكثر من حرفين")
    .max(50, "الاسم طويل جداً"),
});