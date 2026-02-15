import supabase from "../../config/supabase";

export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku")
    .eq("is_active", true);

  if (error) throw error;
  return data;
};

export const getWarehouseStock = async () => {
  const { data, error } = await supabase
    .from("warehouse_stock")
    .select(`
      id,
      quantity,
      products (
        id,
        name,
        sku,
        brands (
          id,
          name
        )
      ),
      warehouses (
        id,
        name
      )
    `);

  if (error) throw error;
  return data;
};

export const getWarehouses = async () => {
  const { data, error } = await supabase
    .from("warehouses")
    .select("id, name");

  if (error) throw error;
  return data;
};

export const getBrands = async () => {
  const { data, error } = await supabase
    .from("brands")
    .select("id, name");

  if (error) throw error;
  return data;
};


// جلب movement_type_id الخاص بـ Manual Adjustment
const getManualAdjustmentTypeId = async () => {
  const { data, error } = await supabase
    .from("stock_movement_types")
    .select("id")
    .eq("movement_name", "Manual Adjustment")
    .single();

  if (error) throw error;
  return data.id;
};

// إضافة أو تحديث المخزون وتسجيل الحركة

// كود API مختصر جداً لأن القاعدة أصبحت ذكية الآن
export const updateStockAction = async (formData) => {
  const { data, error } = await supabase
    .from("stock_movements")
    .insert([{
      product_id: Number(formData.product_id),
      warehouse_id: Number(formData.warehouse_id),
      quantity: Number(formData.quantity),
      unit_cost: Number(formData.cost_price || 0),
      movement_type_id: 1,
      description: "Manual stock entry"
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};