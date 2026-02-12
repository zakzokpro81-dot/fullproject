import { z } from "zod";

export const customerTypeSchema = z.object({
  type_name: z.string().min(1, "Type name is required"),
});
