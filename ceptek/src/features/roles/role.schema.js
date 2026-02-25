import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  description: z.string().optional().or(z.literal("")),
});

export const roleDefaults = {
  name: "",
  description: "",
};
