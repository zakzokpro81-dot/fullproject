import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  is_active: z.boolean().default(true),
});

export const departmentDefaults = {
  name: "",
  is_active: true,
};
