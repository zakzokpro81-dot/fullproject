import { z } from "zod";

export const supplierTypeSchema = z.object({
  type_name: z.string().min(1, "Type name is required").trim(),
});

export const supplierTypeDefaults = {
  type_name: "",
};
