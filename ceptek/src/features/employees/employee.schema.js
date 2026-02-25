import { z } from "zod";

export const employeeSchema = z.object({
  first_name: z.string().min(1, "First name is required").trim(),
  last_name: z.string().min(1, "Last name is required").trim(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  national_id: z.string().optional().or(z.literal("")),
  hire_date: z.string().min(1, "Hire date is required"),
  end_date: z.string().optional().or(z.literal("")),
  employment_status: z.enum(["active", "on_leave", "terminated"]).default("active"),
  department_id: z.coerce.number().positive("Department is required"),
  job_title_id: z.coerce.number().positive("Job title is required"),
  base_salary: z.coerce.number().min(0, "Salary must be non-negative").default(0),
  is_active: z.boolean().default(true),
});

export const employeeDefaults = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address: "",
  national_id: "",
  hire_date: new Date().toISOString().split("T")[0],
  end_date: "",
  employment_status: "active",
  department_id: "",
  job_title_id: "",
  base_salary: 0,
  is_active: true,
};
