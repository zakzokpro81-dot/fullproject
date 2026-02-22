import { z } from "zod";

export const warehouseSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  location: z.string().optional().or(z.literal("")).transform((v) => v ?? ""),
  is_active: z.boolean().default(true),
});

/**
 * Blank form defaults — used by the Form component as the single source of truth.
 * Defined as a plain object because required fields (e.g. name) start empty
 * and would fail schema validation before the user fills them in.
 */
export const warehouseDefaults = {
  name: "",
  location: "",
  is_active: true,
};
