//دوال CRUD للتعامل مع Supabase: getFamilies, createFamily, updateFamily, deleteFamily.
// family.api.js
// دوال CRUD للتعامل مع Supabase لميزة Families
// src/features/families/family.api.js


// src/features/families/family.api.js

import supabase from "../../config/supabase";

// Get all families
export async function getFamilies() {
    const { data, error } = await supabase
        .from("families")
        .select("id, name, slug, is_active, brand (id, name)")
        .order("name", { ascending: true });

    if (error) throw error;
    return data;
}

// Create a new family
export async function createFamily(family) {
    const { data, error } = await supabase
        .from("families")
        .insert(family)
        .select();

    if (error) throw error;
    return data[0];
}

// Update an existing family
export async function updateFamily(id, family) {
    const { data, error } = await supabase
        .from("families")
        .update(family)
        .eq("id", id)
        .select();

    if (error) throw error;
    return data[0];
}

// Delete a family
export async function deleteFamily(id) {
    const { data, error } = await supabase
        .from("families")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return data;
}
