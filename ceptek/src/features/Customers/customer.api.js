import supabase from "../../config/supabase";

const TABLE_NAME = "customers";

export const CUSTOMER_QUERY_KEY = "customers";

export async function getCustomers({ page = 0, pageSize = 10, searchText = "", customerTypeId } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE_NAME)
    .select("*, customer_types(type_name)", { count: "exact" })
    .order("id", { ascending: false })
    .range(from, to);

  if (searchText) {
    const like = `%${searchText}%`;
    query = query.or(`name.ilike.${like},store_name.ilike.${like}`);
  }

  if (customerTypeId) {
    query = query.eq("customer_type_id", customerTypeId);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createCustomer(payload) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCustomer(id, payload) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCustomer(id) {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteCustomers(ids = []) {
  const { error } = await supabase.from(TABLE_NAME).delete().in("id", ids);
  if (error) throw error;
  return true;
}