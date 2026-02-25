import supabase from "../../config/supabase";

export const SUPPLIER_PAYMENT_QUERY_KEY = "supplier_payments";

export async function getSupplierPayments({ page = 0, pageSize = 10, searchText = "" }) {
  let query = supabase
    .from("supplier_payments")
    .select(
      "*, purchase_invoices:purchase_invoices!supplier_payments_purchase_invoice_id_fkey ( id, invoice_number ), accounts:accounts!supplier_payments_account_id_fkey ( id, name )",
      { count: "exact" }
    )
    .order("id", { ascending: false })
    .range(page * pageSize, page * pageSize + pageSize - 1);

  if (searchText) {
    query = query.or(`notes.ilike.%${searchText}%,method.ilike.%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createSupplierPayment(payment) {
  const { data, error } = await supabase.from("supplier_payments").insert([payment]).select();
  if (error) throw error;
  return data;
}

export async function updateSupplierPayment(id, payment) {
  const { data, error } = await supabase.from("supplier_payments").update(payment).eq("id", id).select();
  if (error) throw error;
  return data;
}

export async function deleteSupplierPayment(id) {
  const { error } = await supabase.from("supplier_payments").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteSupplierPayments(ids) {
  const { error } = await supabase.from("supplier_payments").delete().in("id", ids);
  if (error) throw error;
}
