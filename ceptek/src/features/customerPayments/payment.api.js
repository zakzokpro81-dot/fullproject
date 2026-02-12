import supabase from "../../config/supabase";

export const getPayments = async ({ page, pageSize, searchText }) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("payments")
    .select(`
      *,
      invoices (
        id,
        invoice_number,
        customers (
          name
        )
      )
    `, { count: "exact" })
    .order("id", { ascending: false })
    .range(from, to);

  if (searchText) {
    query = query.or(`notes.ilike.%${searchText}%, invoices.invoice_number.ilike.%${searchText}%`);
  }

  const { data, count, error } = await query;
  if (error) throw error;
  return { data, count };
};

export const createPayment = async (newPayment) => {
  const { data, error } = await supabase
    .from("payments")
    .insert([{
      invoice_id: newPayment.invoice_id,
      amount: newPayment.amount,
      date: newPayment.date,
      notes: newPayment.notes
    }])
    .select();
  if (error) throw error;
  return data[0];
};

export const updatePayment = async ({ id, ...updates }) => {
  const { data, error } = await supabase
    .from("payments")
    .update({
      invoice_id: updates.invoice_id,
      amount: updates.amount,
      date: updates.date,
      notes: updates.notes
    })
    .eq("id", id)
    .select();
  if (error) throw error;
  return data[0];
};

export const deletePayment = async (id) => {
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) throw error;
  return id;
};

export const deletePayments = async (ids) => {
  const { error } = await supabase.from("payments").delete().in("id", ids);
  if (error) throw error;
  return ids;
};