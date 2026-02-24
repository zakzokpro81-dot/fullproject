import { z } from "zod";

export const invoiceItemSchema = z.object({
  invoice_id: z.coerce.number().min(1, "Invoice ID is required"),
  product_variant_id: z.coerce.number().min(1, "Please select a product"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unit_price: z.coerce.number().min(0, "Unit price cannot be negative"),
  total_price: z.coerce.number().min(0),
});

export const invoiceFormSchema = z.object({
  customer_id: z.coerce.number().min(1, "Please select a customer"),
  status_id: z.coerce.number().min(1, "Please select a status"),
  invoice_date: z.string().min(1, "Date is required"),
});

export const invoiceFormDefaults = {
  customer_id: "",
  status_id: "",
  invoice_date: new Date().toISOString().split("T")[0],
};
