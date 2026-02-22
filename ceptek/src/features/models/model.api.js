// model.api.js
// دوال CRUD للتعامل مع Supabase لجدول models
// ❌ لا React — هذا ملف بيانات بحت

import supabase from "../../config/supabase";

// Single source of truth for the React Query cache key
export const MODEL_QUERY_KEY = "models";

// ===============================
// Get all models (paginated + search)
// ===============================
export async function getModels({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("models")
    .select(
      `id, name, slug, is_active, family,
       families (
         id,
         name,
         brands ( id, name )
       )`,
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

// ===============================
// Fetch all brands for dropdown
// ===============================
export async function getAllBrands() {
  const { data, error } = await supabase
    .from("brands")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

// ===============================
// Fetch all families for dropdown
// ===============================
export async function getAllFamilies() {
  const { data, error } = await supabase
    .from("families")
    .select("id, name, brand")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

// ===============================
// Create model
// ===============================
export async function createModel(payload) {
  const { data, error } = await supabase
    .from("models")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ===============================
// Update model
// ===============================
export async function updateModel(id, payload) {
  const { data, error } = await supabase
    .from("models")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ===============================
// Delete single model
// ===============================
export async function deleteModel(id) {
  const { error } = await supabase
    .from("models")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

// ===============================
// Delete multiple models (bulk)
// ===============================
export async function deleteModels(ids) {
  const { error } = await supabase
    .from("models")
    .delete()
    .in("id", ids);

  if (error) throw error;
  return true;
}
