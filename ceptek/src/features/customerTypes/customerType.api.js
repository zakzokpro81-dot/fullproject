import supabase from "../../config/supabase";

const TABLE_NAME = "customer_types";

export const CUSTOMER_TYPE_QUERY_KEY = "customerTypes";

export async function getCustomerTypes({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE_NAME)
    .select("id, type_name", { count: "exact" })
    .order("id", { ascending: false })
    .range(from, to);

  if (searchText) {
    query = query.ilike("type_name", `%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createCustomerType(payload) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCustomerType(id, payload) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCustomerType(id) {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteCustomerTypes(ids = []) {
  const { error } = await supabase.from(TABLE_NAME).delete().in("id", ids);
  if (error) throw error;
  return true;
}