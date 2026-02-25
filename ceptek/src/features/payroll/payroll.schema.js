import { z } from "zod";

export const payrollSchema = z.object({
  employee_id: z.coerce.number().positive("Employee is required"),
  period: z.string().min(1, "Period is required (e.g. 2026-02)").trim(),
  base_salary: z.coerce.number().min(0, "Base salary must be non-negative").default(0),
  total_allowances: z.coerce.number().min(0).default(0),
  total_deductions: z.coerce.number().min(0).default(0),
  net_salary: z.coerce.number().min(0).default(0),
  status: z.enum(["draft", "approved", "paid"]).default("draft"),
});

export const payrollDefaults = {
  employee_id: "",
  period: "",
  base_salary: 0,
  total_allowances: 0,
  total_deductions: 0,
  net_salary: 0,
  status: "draft",
};
