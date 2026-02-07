// هذا الملف مسؤول عن التعامل مع Supabase لجدول models
// يحتوي على دوال:
// - جلب الموديلات
// - إضافة موديل
// - حذف موديل
// - تعديل موديل
// لا يحتوي على أي UI


import supabase from "../../config/supabase";

// ===============================
// Get all models with relations
// ===============================
export const getModels = async () => {
    const { data, error } = await supabase
        .from("models")
        .select(`
      id,
      name,
      slug,
      is_active,
      family,
      families (
        id,
        name,
        brands (
          id,
          name
        )
      )
    `)
        .order("id", { ascending: true });

    if (error) {
        console.error("Error fetching models:", error);
        throw error;
    }

    return data;
};

// ===============================
// Create model
// ===============================
export const createModel = async (model) => {
    const { data, error } = await supabase.from("models").insert([model]);

    if (error) {
        console.error("Error creating model:", error);
        throw error;
    }

    return data;
};

// ===============================
// Update model
// ===============================
export const updateModel = async (id, model) => {
    const { data, error } = await supabase
        .from("models")
        .update(model)
        .eq("id", id);

    if (error) {
        console.error("Error updating model:", error);
        throw error;
    }

    return data;
};

// ===============================
// Delete model
// ===============================
export const deleteModel = async (id) => {
    const { data, error } = await supabase.from("models").delete().eq("id", id);

    if (error) {
        console.error("Error deleting model:", error);
        throw error;
    }

    return data;
};


export async function getAttributesByPart(product_type, part_type_id) {
    const { data, error } = await supabase
        .from("attributes")
        .select("*")
        .eq("product_type", product_type)
        .eq("part_type_id", part_type_id)
        .order("id", { ascending: true });

    if (error) throw error;
    return data;
}
