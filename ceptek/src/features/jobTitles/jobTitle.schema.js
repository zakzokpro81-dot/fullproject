import { z } from "zod";

export const jobTitleSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  department_id: z.coerce.number().positive("Department is required"),
  is_active: z.boolean().default(true),
});

export const jobTitleDefaults = {
  title: "",
  department_id: "",
  is_active: true,
};
