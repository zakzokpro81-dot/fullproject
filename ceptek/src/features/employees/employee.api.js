import supabase from "../../config/supabase";

export const EMPLOYEE_QUERY_KEY = "employees";

export async function getEmployees({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("employees")
    .select(
      `id, first_name, last_name, email, phone, address, national_id,
       hire_date, end_date, employment_status, department_id, job_title_id,
       base_salary, is_active, created_at,
       departments:departments!employees_department_id_fkey ( id, name ),
       job_titles:job_titles!employees_job_title_id_fkey ( id, title )`,
      { count: "exact" }
    )
    .order("id", { ascending: true })
    .range(from, to);

  if (searchText) {
    query = query.or(`first_name.ilike.%${searchText}%,last_name.ilike.%${searchText}%,email.ilike.%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createEmployee(payload) {
  const { data, error } = await supabase.from("employees").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateEmployee(id, payload) {
  const { data, error } = await supabase.from("employees").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteEmployee(id) {
  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteEmployees(ids) {
  const { error } = await supabase.from("employees").delete().in("id", ids);
  if (error) throw error;
  return true;
}
