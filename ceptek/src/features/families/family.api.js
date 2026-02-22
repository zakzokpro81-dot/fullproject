// family.api.js
// دوال CRUD للتعامل مع Supabase لميزة Families

import supabase from "../../config/supabase";

export const FAMILY_QUERY_KEY = "families";

// Fetch families with server-side pagination and search
export async function getFamilies({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("families")
    .select(
      `id, name, slug, is_active, brand, product_type_id,
       brands:brands!families_brand_fkey ( id, name ),
       product_types:product_types!families_product_type_fkey ( id, name )`,
      { count: "exact" }
    )
    .order("id", { ascending: true })
    .range(from, to);

  if (searchText) {
    query = query.or(`name.ilike.%${searchText}%,slug.ilike.%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

// Create family
export async function createFamily(payload) {
  const { data, error } = await supabase
    .from("families")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update family
export async function updateFamily(id, payload) {
  const { data, error } = await supabase
    .from("families")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete single family
export async function deleteFamily(id) {
  const { error } = await supabase
    .from("families")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

// Delete multiple families
export async function deleteFamilies(ids) {
  const { error } = await supabase
    .from("families")
    .delete()
    .in("id", ids);

  if (error) throw error;
  return true;
}
