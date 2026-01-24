// src/features/products/product.api.js
import supabase from "../../config/supabase";



// جلب كل المنتجات الموجودة في جدول Products
export async function getProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('id, name, brand_id, model_id, sku, cost_price, sell_price, stock, description, is_active')
        .order('name', { ascending: true });

    if (error) throw error;
    return data;
}

// إنشاء منتج جديد في جدول Products
export async function createProduct(product) {
    const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// **الدالة المهمة** لجلب Models مع Brand وFamily
export async function getModelsWithBrandAndFamily() {
    const { data, error } = await supabase
        .from('models')
        .select(`
      id,
      name,
      family!inner (
        name,
        brand!inner (
          id,
          name
        )
      )
    `)
        .order('name', { ascending: true });

    if (error) throw error;

    // تحويل البيانات لتصبح مسطحة
    return data.map((m) => ({
        id: m.id,
        model_name: m.name,
        family_name: m.family.name,
        brand_name: m.family.brand.name,
        brand_id: m.family.brand.id,
    }));
}


export async function getWarehouses() {
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

// جلب كل Variants مع القيم الخاصة بها
export async function getVariantsWithValues() {
  const { data, error } = await supabase
    .from('variants')
    .select(`
      id,
      name,
      values:variant_values(id, value)
    `)
    .order('id', { ascending: true });

  if (error) throw error;

  // تحويل البيانات لتصبح مسطحة بشكل مناسب للفورم
  return data.map(v => ({
    id: v.id,
    name: v.name,
    values: v.values.map(val => ({ id: val.id, value: val.value }))
  }));
}