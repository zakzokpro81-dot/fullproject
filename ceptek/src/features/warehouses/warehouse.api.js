import supabase from "../../config/supabase";

export const WAREHOUSE_QUERY_KEY = "warehouses";

// Fetch warehouses with pagination and search
export async function getWarehouses({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("warehouses")
    .select("id, name, location, is_active", { count: "exact" })
    .order("name", { ascending: true })
    .range(from, to);

  if (searchText) {
    query = query.or(`name.ilike.%${searchText}%,location.ilike.%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

// Create a new warehouse
export async function createWarehouse(payload) {
  const { data, error } = await supabase
    .from("warehouses")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update warehouse
export async function updateWarehouse(id, payload) {
  const { data, error } = await supabase
    .from("warehouses")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete single warehouse
export async function deleteWarehouse(id) {
  const { error } = await supabase.from("warehouses").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// Delete multiple warehouses
export async function deleteWarehouses(ids) {
  const { error } = await supabase.from("warehouses").delete().in("id", ids);
  if (error) throw error;
  return true;
}
