// src/features/products/product.schema.js
import { z } from 'zod';

export const productSchema = z.object({
    name: z.string().min(1, 'اسم المنتج مطلوب'),
    brand_id: z.number().nullable(),
    family_id: z.number().nullable(),
    model_id: z.number().nullable(),
    sku: z.string().optional(),
    cost_price: z.number().min(0),
    sell_price: z.number().min(0, 'السعر مطلوب'),
    stock: z.number().min(0),
    description: z.string().optional(),
    is_active: z.boolean().default(true),
});
