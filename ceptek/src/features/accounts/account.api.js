import supabase from "../../config/supabase";

const TABLE_NAME = "accounts";

export const ACCOUNT_QUERY_KEY = "accounts";

export async function getAccounts({ page = 0, pageSize = 10, searchText = "", accountType = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE_NAME)
    .select("id, account_code, name, account_type, account_subtype, parent_id, description, opening_balance, balance, is_system, is_active, created_at", { count: "exact" })
    .order("account_code", { ascending: true })
    .range(from, to);

  if (accountType) {
    query = query.eq("account_type", accountType);
  }

  if (searchText) {
    const like = `%${searchText}%`;
    query = query.or(`name.ilike.${like},account_code.ilike.${like},description.ilike.${like}`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getAccountsTree() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id, account_code, name, account_type")
    .eq("is_active", true)
    .order("account_code", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createAccount(payload) {
  const clean = { ...payload };
  if (!clean.parent_id) delete clean.parent_id;
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(clean)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAccount(id, payload) {
  const clean = { ...payload };
  if (!clean.parent_id) clean.parent_id = null;
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(clean)
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