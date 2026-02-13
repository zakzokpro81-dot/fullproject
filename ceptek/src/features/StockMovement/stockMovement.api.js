import supabase from "../../config/supabase";

export const getStockMovements = async ({ page, pageSize, searchText }) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("stock_movements")
    .select(`
      *,
      reference_id,
  reference_type,
      products (
        name,
        sku
      ),
      warehouses (
        name
      ),
      stock_movement_types (
        movement_name
      )
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  // ملاحظة: الفلترة بـ ilike على جداول مرتبطة (Join) في سوبابيز 
  // تتطلب استخدام سياق معين، إذا لم يعمل البحث، سنعالجه لاحقاً.
  if (searchText) {
    query = query.ilike("products.name", `%${searchText}%`);
  }

  const { data, count, error } = await query;
  if (error) {
    console.error("Supabase Select Error:", error.message);
    throw error;
  }
  console.log("Data Debug:", data[0]);
  return { data, count };
};


// جلب أنواع الحركات (إضافة، صرف، تحويل، إلخ)
export const getMovementTypes = async () => {
  const { data, error } = await supabase.from("stock_movement_types").select("*");
  if (error) throw error;
  return data;
};

// جلب المستودعات
export const getWarehouses = async () => {
  const { data, error } = await supabase.from("warehouses").select("id, name");
  if (error) throw error;
  return data;
};


export const createStockMovement = async (movement) => {
  const { data, error } = await supabase
    .from("stock_movements")
    .insert([{
      product_id: movement.product_id,
      quantity: movement.quantity,
      warehouse_id: movement.warehouse_id,
      movement_type_id: movement.movement_type_id,
      reference_type: movement.reference_type,
      product_variant_id: null // نرسلها null لأن الجدول لا يوجد له بيانات حالياً
    }])
    .select();

  if (error) throw error;
  return data[0];
};