// 1️⃣ brand.api.js

// 📌 مسؤول فقط عن التواصل مع Supabase

// جلب البيانات

// إضافة

// تعديل

// حذف

// ❌ لا React
// ❌ لا UI
// ❌ لا state

// هذا الملف “غبي” لكنه موثوق

import supabase from "../../config/supabase";

export const BRAND_QUERY_KEY = "brands";

/**
 * Get brands (paginated + server-side search)
 */
export async function getBrands({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("brands")
    .select("id, name, slug, is_active", { count: "exact" })
    .order("name", { ascending: true });

  if (searchText) {
    query = query.or(
      `name.ilike.%${searchText}%,slug.ilike.%${searchText}%`
    );
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return { data, count };
}

/**
 * Create new brand
 */
export async function createBrand(payload) {
  const { data, error } = await supabase
    .from("brands")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Update brand
 */
export async function updateBrand(id, payload) {
  const { data, error } = await supabase
    .from("brands")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Delete brand
 */
export async function deleteBrand(id) {
  const { error } = await supabase
    .from("brands")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}

/**
 * Delete multiple brands by ID array (bulk delete)
 */
export async function deleteBrands(ids) {
  const { error } = await supabase
    .from("brands")
    .delete()
    .in("id", ids);

  if (error) throw error;
  return true;
}

