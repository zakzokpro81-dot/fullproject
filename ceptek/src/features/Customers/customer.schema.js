import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(3, "Name is too short").trim(),
  store_name: z.string().optional().nullable(),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  customer_type_id: z.coerce.number().nullable().optional(),
  is_active: z.boolean().optional().default(true),
});

export const customerDefaults = {
  name: "",
  store_name: "",
  email: "",
  phone: "",
  address: "",
  customer_type_id: "",
  is_active: true,
};