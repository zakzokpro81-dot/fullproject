import * as z from "zod";

export const warehouseStockSchema = z.object({
    warehouse_id: z.number({ required_error: "Please select a warehouse" }),
    product_id: z.number({ required_error: "Please select a product" }),
    quantity: z
        .number({ required_error: "Please enter quantity" })
        .min(1, "Quantity must be at least 1"),
});
