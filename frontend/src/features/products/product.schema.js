import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  brand_id: z.number().nullable(),
  model_id: z.number().nullable(),
  warehouse_id: z.number().nullable(),
  variants: z.string().optional(),
  sku: z.string().optional(),
  cost_price: z.number().min(0),
  sell_price: z.number().min(0, 'Sell price required'),
  stock: z.number().min(0),
  is_active: z.boolean().default(true),
});
