import supabase from "../../config/supabase";

export const DEPARTMENT_QUERY_KEY = "departments";

export async function getDepartments({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("departments")
    .select("id, name, is_active, created_at", { count: "exact" })
    .order("id", { ascending: true })
    .range(from, to);

  if (searchText) {
    query = query.or(`name.ilike.%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createDepartment(payload) {
  const { data, error } = await supabase
    .from("departments")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDepartment(id, payload) {
  const { data, error } = await supabase
    .from("departments")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDepartment(id) {
  const { error } = await supabase.from("departments").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteDepartments(ids) {
  const { error } = await supabase.from("departments").delete().in("id", ids);
  if (error) throw error;
  return true;
}
