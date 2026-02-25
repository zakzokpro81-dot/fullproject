import supabase from "../../config/supabase";

export const ROLE_QUERY_KEY = "roles";

export async function getRoles({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("roles")
    .select("id, name, description, created_at", { count: "exact" })
    .order("id", { ascending: true })
    .range(from, to);

  if (searchText) {
    query = query.or(`name.ilike.%${searchText}%,description.ilike.%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createRole(payload) {
  const { data, error } = await supabase.from("roles").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateRole(id, payload) {
  const { data, error } = await supabase.from("roles").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRole(id) {
  const { error } = await supabase.from("roles").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteRoles(ids) {
  const { error } = await supabase.from("roles").delete().in("id", ids);
  if (error) throw error;
  return true;
}
