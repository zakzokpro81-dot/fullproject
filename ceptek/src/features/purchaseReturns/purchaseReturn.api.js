import supabase from "../../config/supabase";

export const PURCHASE_RETURN_QUERY_KEY = "purchase_returns";

export async function getPurchaseReturns({ page = 0, pageSize = 10, searchText = "" }) {
  let query = supabase
    .from("purchase_returns")
    .select(
      "*, return_statuses:return_statuses!purchase_returns_status_id_fkey ( id, status_name )",
      { count: "exact" }
    )
    .order("id", { ascending: false })
    .range(page * pageSize, page * pageSize + pageSize - 1);

  if (searchText) {
    query = query.or(`reason.ilike.%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createPurchaseReturn(returnData) {
  const { data, error } = await supabase.from("purchase_returns").insert([returnData]).select();
  if (error) throw error;
  return data;
}

export async function updatePurchaseReturn(id, returnData) {
  const { data, error } = await supabase.from("purchase_returns").update(returnData).eq("id", id).select();
  if (error) throw error;
  return data;
}

export async function deletePurchaseReturn(id) {
  const { error } = await supabase.from("purchase_returns").delete().eq("id", id);
  if (error) throw error;
}

export async function deletePurchaseReturns(ids) {
  const { error } = await supabase.from("purchase_returns").delete().in("id", ids);
  if (error) throw error;
}
