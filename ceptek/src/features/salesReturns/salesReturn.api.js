import supabase from "../../config/supabase";

export const SALES_RETURN_QUERY_KEY = "sales_returns";

export async function getSalesReturns({ page = 0, pageSize = 10, searchText = "" }) {
  let query = supabase
    .from("sales_returns")
    .select(
      `*, 
       invoices:invoices!sales_returns_invoice_id_fkey ( id, invoice_number, customers:customers!invoices_customer_id_fkey ( id, name ) ),
       return_statuses:return_statuses!sales_returns_status_id_fkey ( id, status_name )`,
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

export async function createSalesReturn(returnData) {
  const { data, error } = await supabase.from("sales_returns").insert([returnData]).select();
  if (error) throw error;
  return data;
}

export async function updateSalesReturn(id, returnData) {
  const { data, error } = await supabase.from("sales_returns").update(returnData).eq("id", id).select();
  if (error) throw error;
  return data;
}

export async function deleteSalesReturn(id) {
  const { error } = await supabase.from("sales_returns").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteSalesReturns(ids) {
  const { error } = await supabase.from("sales_returns").delete().in("id", ids);
  if (error) throw error;
}
