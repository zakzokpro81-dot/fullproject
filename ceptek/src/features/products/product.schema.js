import { z } from "zod";

/**
 * Schema for the Add Product form.
 * Validates the form-level fields (Autocomplete objects, not flat IDs).
 */
export const addProductSchema = z.object({
  category: z
    .object({ id: z.number(), name: z.string() })
    .nullable()
    .refine((val) => val !== null, { message: "Category is required" }),
  productType: z
    .object({ id: z.number() })
    .nullable()
    .refine((val) => val !== null, { message: "Product type is required" }),
  model: z
    .object({ label: z.string(), brand_id: z.number().nullable(), model_id: z.number().nullable(), family_id: z.number().nullable() })
    .nullable()
    .refine((val) => val !== null, { message: "Model is required" }),
  warehouse: z
    .object({ id: z.number() })
    .nullable()
    .refine((val) => val !== null, { message: "Warehouse is required" }),
  sellPrice: z.coerce.number().min(0, "Sell price must be >= 0"),
  costPrice: z.coerce.number().min(0, "Cost price must be >= 0"),
  stock: z.coerce.number().min(0, "Stock must be >= 0"),
  description: z.string().optional(),
  attributes: z.record(z.any()).optional(),
});

/**
 * Schema for the Edit Product form.
 */
export const editProductSchema = z.object({
  sellPrice: z.coerce.number().min(0, "Sell price must be >= 0"),
  costPrice: z.coerce.number().min(0, "Cost price must be >= 0"),
  stock: z.coerce.number().min(0, "Stock must be >= 0"),
  description: z.string().optional(),
  is_active: z.boolean(),
  warehouse: z.object({ id: z.number() }).nullable().optional(),
  category: z.object({ id: z.number() }).nullable().optional(),
  attributes: z.record(z.any()).optional(),
});

/** @deprecated — use addProductSchema or editProductSchema */
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
