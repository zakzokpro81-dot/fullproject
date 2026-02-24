import supabase from "../../config/supabase";

const TABLE_NAME = "payments";

export const PAYMENT_QUERY_KEY = "payments";

export async function getPayments({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE_NAME)
    .select("id, invoice_id, amount, date, notes, invoices(id, invoice_number, customers(name))", { count: "exact" })
    .order("id", { ascending: false })
    .range(from, to);

  if (searchText) {
    query = query.ilike("notes", `%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getInvoicesForSelect() {
  const { data, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, customers(name)")
    .order("id", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createPayment(payload) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePayment(id, payload) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePayment(id) {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deletePayments(ids = []) {
  const { error } = await supabase.from(TABLE_NAME).delete().in("id", ids);
  if (error) throw error;
  return true;
}