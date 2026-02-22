import supabase from "../../config/supabase";

export const ATTRIBUTE_QUERY_KEY = "attributes";

export async function getAttributes({
  page = 0,
  pageSize = 10,
  searchText = "",
  filters = {},
} = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("attributes")
    .select("*", { count: "exact" })
    .order("name", { ascending: true })
    .range(from, to);

  if (searchText) {
    query = query.or(`name.ilike.%${searchText}%,slug.ilike.%${searchText}%`);
  }

  if (filters.data_type) {
    query = query.eq("data_type", filters.data_type);
  }
  if (typeof filters.has_options === "boolean") {
    query = query.eq("has_options", filters.has_options);
  }
  if (typeof filters.is_active === "boolean") {
    query = query.eq("is_active", filters.is_active);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createAttribute(payload) {
  const { data, error } = await supabase
    .from("attributes")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAttribute(id, payload) {
  const { data, error } = await supabase
    .from("attributes")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAttribute(id) {
  const { error } = await supabase.from("attributes").delete().eq("id", id);

  if (error) throw error;
  return true;
}

export async function deleteAttributes(ids) {
  const { error } = await supabase.from("attributes").delete().in("id", ids);

  if (error) throw error;
  return true;
}
