import supabase from "../../config/supabase";

export const SUPPLIER_QUERY_KEY = "suppliers";

export async function getSuppliers({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("suppliers")
    .select(
      `id, name, company_name, email, phone, phone2, address, tax_number,
       notes, is_active, supplier_type_id, created_at,
       supplier_types:supplier_types!suppliers_supplier_type_id_fkey ( id, type_name )`,
      { count: "exact" }
    )
    .order("id", { ascending: true })
    .range(from, to);

  if (searchText) {
    query = query.or(`name.ilike.%${searchText}%,company_name.ilike.%${searchText}%,email.ilike.%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createSupplier(payload) {
  const { data, error } = await supabase.from("suppliers").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateSupplier(id, payload) {
  const { data, error } = await supabase.from("suppliers").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSupplier(id) {
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteSuppliers(ids) {
  const { error } = await supabase.from("suppliers").delete().in("id", ids);
  if (error) throw error;
  return true;
}
