import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  store_name: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  customer_type_id: z.number().optional().nullable(),
});
