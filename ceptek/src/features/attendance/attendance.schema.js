import { z } from "zod";

export const attendanceSchema = z.object({
  employee_id: z.coerce.number().positive("Employee is required"),
  work_date: z.string().min(1, "Work date is required"),
  check_in: z.string().optional().or(z.literal("")),
  check_out: z.string().optional().or(z.literal("")),
  status: z.enum(["present", "absent", "late", "leave", "half_day"]).default("present"),
  notes: z.string().optional().or(z.literal("")),
});

export const attendanceDefaults = {
  employee_id: "",
  work_date: new Date().toISOString().split("T")[0],
  check_in: "",
  check_out: "",
  status: "present",
  notes: "",
};
