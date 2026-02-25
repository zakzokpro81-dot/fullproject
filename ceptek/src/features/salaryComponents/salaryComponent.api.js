import supabase from "../../config/supabase";

export const SALARY_COMPONENT_QUERY_KEY = "salary_components";

export async function getSalaryComponents({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("salary_components")
    .select("id, name, type, is_active, created_at", { count: "exact" })
    .order("id", { ascending: true })
    .range(from, to);

  if (searchText) {
    query = query.or(`name.ilike.%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createSalaryComponent(payload) {
  const { data, error } = await supabase.from("salary_components").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateSalaryComponent(id, payload) {
  const { data, error } = await supabase.from("salary_components").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSalaryComponent(id) {
  const { error } = await supabase.from("salary_components").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteSalaryComponents(ids) {
  const { error } = await supabase.from("salary_components").delete().in("id", ids);
  if (error) throw error;
  return true;
}
