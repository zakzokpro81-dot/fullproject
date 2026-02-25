import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  company_name: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  phone2: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  tax_number: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
  supplier_type_id: z.coerce.number().positive("Supplier type is required"),
});

export const supplierDefaults = {
  name: "",
  company_name: "",
  email: "",
  phone: "",
  phone2: "",
  address: "",
  tax_number: "",
  notes: "",
  is_active: true,
  supplier_type_id: "",
};
