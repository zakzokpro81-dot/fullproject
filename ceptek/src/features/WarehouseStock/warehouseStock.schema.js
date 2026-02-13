import { z } from "zod";

export const stockMovementSchema = z.object({
  product_id: z.number().min(1, "Product is required"),
  warehouse_id: z.number().min(1, "Warehouse is required"),
  movement_type_id: z.number().min(1, "Movement type is required"),
  quantity: z.number().min(1, "Quantity must be greater than 0"),
  notes: z.string().optional(),
});
