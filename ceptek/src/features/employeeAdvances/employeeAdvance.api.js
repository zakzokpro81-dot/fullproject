import supabase from "../../config/supabase";

export const EMPLOYEE_ADVANCE_QUERY_KEY = "employee_advances";

export async function getEmployeeAdvances({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("employee_advances")
    .select(
      `id, employee_id, amount, remaining_amount, reason, status,
       approved_by, account_id, created_at,
       employees:employees!employee_advances_employee_id_fkey ( id, first_name, last_name ),
       accounts:accounts!employee_advances_account_id_fkey ( id, name )`,
      { count: "exact" }
    )
    .order("id", { ascending: false })
    .range(from, to);

  if (searchText) {
    query = query.or(`reason.ilike.%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createEmployeeAdvance(payload) {
  const { data, error } = await supabase.from("employee_advances").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateEmployeeAdvance(id, payload) {
  const { data, error } = await supabase.from("employee_advances").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteEmployeeAdvance(id) {
  const { error } = await supabase.from("employee_advances").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteEmployeeAdvances(ids) {
  const { error } = await supabase.from("employee_advances").delete().in("id", ids);
  if (error) throw error;
  return true;
}
