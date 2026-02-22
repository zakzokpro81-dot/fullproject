import { z } from "zod";

export const warehouseStockSchema = z.object({
  product_id: z.coerce.number().positive("Product is required"),
  warehouse_id: z.coerce.number().positive("Warehouse is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unit_cost: z.coerce.number().min(0, "Cost must be 0 or more").default(0),
});

/**
 * Blank object with all schema defaults applied.
 * Single source of truth — used by WarehouseStockForm.
 */
export const warehouseStockDefaults = {
  product_id: 0,
  warehouse_id: 0,
  quantity: 1,
  unit_cost: 0,
};
