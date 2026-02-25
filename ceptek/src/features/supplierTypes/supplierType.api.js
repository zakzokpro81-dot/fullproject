import supabase from "../../config/supabase";

export const SUPPLIER_TYPE_QUERY_KEY = "supplier_types";

export async function getSupplierTypes({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("supplier_types")
    .select("id, type_name, created_at", { count: "exact" })
    .order("id", { ascending: true })
    .range(from, to);

  if (searchText) {
    query = query.or(`type_name.ilike.%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createSupplierType(payload) {
  const { data, error } = await supabase.from("supplier_types").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateSupplierType(id, payload) {
  const { data, error } = await supabase.from("supplier_types").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSupplierType(id) {
  const { error } = await supabase.from("supplier_types").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteSupplierTypes(ids) {
  const { error } = await supabase.from("supplier_types").delete().in("id", ids);
  if (error) throw error;
  return true;
}
