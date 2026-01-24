import { z } from "zod";

export const modelSchema = z.object({
  name: z.string().min(1, "Model name is required"),
  family: z.number().min(1, "Family is required"),
  slug: z.string().min(1, "Slug is required"),
});
