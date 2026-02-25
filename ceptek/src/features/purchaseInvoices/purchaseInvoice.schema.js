import { z } from "zod";

export const purchaseInvoiceSchema = z.object({
  supplier_id: z.coerce.number().positive("Supplier is required"),
  purchase_order_id: z.coerce.number().positive().optional().or(z.literal("")),
  invoice_date: z.string().min(1, "Invoice date is required"),
  total_amount: z.coerce.number().min(0).default(0),
  paid_amount: z.coerce.number().min(0).default(0),
  status_id: z.coerce.number().positive("Status is required"),
  invoice_number: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        product_id: z.coerce.number().positive(),
        product_name: z.string().optional(),
        quantity: z.coerce.number().min(1, "Qty ≥ 1"),
        unit_cost: z.coerce.number().min(0),
      }),
    )
    .default([]),
});

export const purchaseInvoiceDefaults = {
  supplier_id: "",
  purchase_order_id: "",
  invoice_date: new Date().toISOString().split("T")[0],
  total_amount: 0,
  paid_amount: 0,
  status_id: 1,
  invoice_number: "",
  notes: "",
  items: [],
};
