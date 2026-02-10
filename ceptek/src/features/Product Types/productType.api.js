import supabase from "../../config/supabase";

// اسم الجدول في قاعدة البيانات
const TABLE_NAME = "product_types";

// جلب جميع أنواع المنتجات مع التصنيف التابع لها
export const getProductTypes = async () => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
      *,
      product_categories (
        id,
        name
      )
    `)
        .order("id", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// إضافة نوع منتج جديد
export const createProductType = async (productType) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([productType])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// تعديل نوع منتج
export const updateProductType = async ({ id, ...productType }) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(productType)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// حذف نوع منتج
export const deleteProductType = async (id) => {
    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    return id;
};
