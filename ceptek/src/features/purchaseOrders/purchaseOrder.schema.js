import { z } from "zod";

export const purchaseOrderSchema = z.object({
  supplier_id: z.coerce.number().positive("Supplier is required"),
  warehouse_id: z.coerce.number().positive("Warehouse is required").optional().or(z.literal("")),
  order_date: z.string().min(1, "Order date is required"),
  total_amount: z.coerce.number().min(0).default(0),
  notes: z.string().optional().or(z.literal("")),
  status_id: z.coerce.number().positive("Status is required"),
});

export const purchaseOrderDefaults = {
  supplier_id: "",
  warehouse_id: "",
  order_date: new Date().toISOString().split("T")[0],
  total_amount: 0,
  notes: "",
  status_id: 1,
};
