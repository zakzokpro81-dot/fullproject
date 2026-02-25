import supabase from "../../config/supabase";

export const PURCHASE_INVOICE_QUERY_KEY = "purchase_invoices";

export async function getPurchaseInvoices({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("purchase_invoices")
    .select(
      `id, supplier_id, purchase_order_id, invoice_date, total_amount,
       paid_amount, status_id, invoice_number, notes, created_by, created_at,
       suppliers:suppliers!purchase_invoices_supplier_id_fkey ( id, name ),
       invoice_statuses:invoice_statuses!purchase_invoices_status_id_fkey ( id, status_name )`,
      { count: "exact" }
    )
    .order("id", { ascending: false })
    .range(from, to);

  if (searchText) {
    query = query.or(`invoice_number.ilike.%${searchText}%,notes.ilike.%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createPurchaseInvoice(payload) {
  const { data, error } = await supabase.from("purchase_invoices").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updatePurchaseInvoice(id, payload) {
  const { data, error } = await supabase.from("purchase_invoices").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deletePurchaseInvoice(id) {
  const { error } = await supabase.from("purchase_invoices").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deletePurchaseInvoices(ids) {
  const { error } = await supabase.from("purchase_invoices").delete().in("id", ids);
  if (error) throw error;
  return true;
}
