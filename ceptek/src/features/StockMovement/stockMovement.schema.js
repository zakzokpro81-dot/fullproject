import { z } from "zod";

export const stockMovementSchema = z.object({
  product_id: z.coerce.number().min(1, "Product is required"),
  warehouse_id: z.coerce.number().min(1, "Warehouse is required"),
  movement_type_id: z.coerce.number().min(1, "Movement type is required"),
  quantity: z.coerce.number(),
  unit_cost:z.coerce.number(),
  reference_type: z.string().optional().nullable(),
});