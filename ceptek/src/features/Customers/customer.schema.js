import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(3, "Name is too short"),
  store_name: z.string().optional().nullable(),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  customer_type_id: z.number().nullable().optional(), // ربط مع جدول الأنواع
  is_active: z.boolean().default(true),
});