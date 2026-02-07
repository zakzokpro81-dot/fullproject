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

/**
 * Get all brands
 */
export async function getBrands() {
  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug, is_active")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
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

