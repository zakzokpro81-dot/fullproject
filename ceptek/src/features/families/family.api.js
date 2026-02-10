//دوال CRUD للتعامل مع Supabase: getFamilies, createFamily, updateFamily, deleteFamily.
// family.api.js
// دوال CRUD للتعامل مع Supabase لميزة Families
// src/features/families/family.api.js


// src/features/families/family.api.js
// family.api.js
// دوال CRUD للتعامل مع Supabase لميزة Families


import supabase from "../../config/supabase";

// Fetch all families
export const getFamilies = async () => {
  const { data, error } = await supabase
    .from("families")
    .select(`
      id,
      name,
      slug,
      is_active,
      brand,
      product_type_id,
      brands:brands!families_brand_fkey ( id, name ),
      product_types:product_types!families_product_type_fkey ( id, name )
    `)
    .order("id", { ascending: true });

  if (error) throw error;
  return data;
};


// Create family
export const createFamily = async (family) => {
    const { data, error } = await supabase
        .from("families")
        .insert([family])
        .select();

    if (error) throw error;
    return data[0];
};

// Update family
export const updateFamily = async ({ id, ...family }) => {
    const { data, error } = await supabase
        .from("families")
        .update(family)
        .eq("id", id)
        .select();

    if (error) throw error;
    return data[0];
};

// Delete family
export const deleteFamily = async (id) => {
    const { error } = await supabase
        .from("families")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return true;
};
