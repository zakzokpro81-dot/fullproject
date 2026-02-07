import  supabase  from "../../config/supabase";

// جلب كل السجلات
export async function fetchWarehouseStocks() {
    const { data, error } = await supabase
        .from("warehouse_stock")
        .select(`
      id,
      quantity,
      warehouse:warehouse_id(name),
      product:product_id(name, brand(id, name), model(id, name))
    `)
        .order("id", { ascending: true });

    if (error) throw error;
    return data;
}

// إضافة سجل جديد
export async function createWarehouseStock(payload) {
    const { data, error } = await supabase
        .from("warehouse_stock")
        .insert([payload])
        .select();
    if (error) throw error;
    return data;
}

// تعديل سجل
export async function updateWarehouseStock(id, payload) {
    const { data, error } = await supabase
        .from("warehouse_stock")
        .update(payload)
        .eq("id", id)
        .select();
    if (error) throw error;
    return data;
}

// حذف سجل
export async function deleteWarehouseStock(id) {
    const { data, error } = await supabase
        .from("warehouse_stock")
        .delete()
        .eq("id", id);
    if (error) throw error;
    return data;
}

// جلب كل المستودعات للمستعمل في dropdown
export async function fetchWarehouses() {
    const { data, error } = await supabase
        .from("warehouses")
        .select("id, name")
        .order("name");
    if (error) throw error;
    return data;
}

// جلب كل المنتجات للمستعمل في autocomplete
export async function fetchProducts() {
    const { data, error } = await supabase
        .from("products")
        .select("id, name, brand(id, name), model(id, name)")
        .order("name");
    if (error) throw error;
    return data;
}
