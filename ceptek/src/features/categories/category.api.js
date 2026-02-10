import supabase from "../../config/supabase";

// اسم الجدول في قاعدة البيانات
const TABLE_NAME = "product_categories";

// جلب جميع التصنيفات
export const getCategories = async () => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// إضافة تصنيف جديد
export const createCategory = async (product_categories) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([product_categories])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// تعديل تصنيف
export const updateCategory = async ({ id, ...product_categories }) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(product_categories)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// حذف تصنيف
export const deleteCategory = async (id) => {
    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    return id;
};
