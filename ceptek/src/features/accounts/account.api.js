import supabase from "../../config/supabase";

const TABLE_NAME = "accounts";

export const ACCOUNT_QUERY_KEY = "accounts";

export async function getAccounts({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE_NAME)
    .select("id, name, account_type, balance, is_active, created_at", { count: "exact" })
    .order("name", { ascending: true })
    .range(from, to);

  if (searchText) {
    const like = `%${searchText}%`;
    query = query.or(`name.ilike.${like},account_type.ilike.${like}`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createAccount(payload) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAccount(id, payload) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAccount(id) {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteAccounts(ids = []) {
  const { error } = await supabase.from(TABLE_NAME).delete().in("id", ids);
  if (error) throw error;
  return true;
}