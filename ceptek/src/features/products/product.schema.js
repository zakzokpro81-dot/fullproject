import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  brand_id: z.number(),
  family_id: z.number(),
  model_id: z.number(),
  sell_price: z.number().min(0),
  cost_price: z.number().min(0).optional(),
  stock: z.number().min(0),
  is_active: z.boolean(),
  description: z.string().optional(),
});
