import supabase from "../../config/supabase";

export const PAYROLL_QUERY_KEY = "payroll";

export async function getPayroll({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("payroll")
    .select(
      `id, employee_id, period, base_salary, total_allowances, total_deductions,
       net_salary, status, approved_by, created_at,
       employees:employees!payroll_employee_id_fkey ( id, first_name, last_name )`,
      { count: "exact" }
    )
    .order("id", { ascending: false })
    .range(from, to);

  if (searchText) {
    query = query.or(`period.ilike.%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createPayroll(payload) {
  const { data, error } = await supabase.from("payroll").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updatePayroll(id, payload) {
  const { data, error } = await supabase.from("payroll").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deletePayroll(id) {
  const { error } = await supabase.from("payroll").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deletePayrolls(ids) {
  const { error } = await supabase.from("payroll").delete().in("id", ids);
  if (error) throw error;
  return true;
}
