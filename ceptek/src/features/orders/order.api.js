import supabase from "../../config/supabase";

export const ORDER_QUERY_KEY = "orders";

// 1. جلب كافة الطلبات مع تفاصيل العميل والحالة
export const getOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_date,
      notes,
      customer_id,
      status_id,
      warehouse_id,
      customers ( name ),
      order_statuses ( status_name ),
      warehouses ( name ), 
      order_items (
        quantity,
        notes,
        product_variant_id,
        products:product_variant_id ( id, name, sku )


      )
    `)
    .order("order_date", { ascending: false });
       

  if (error) {
    console.error("Fetch Error:", error.message);
    throw error;
  }

  return data.map((order) => {
    // التدقيق هنا: Supabase قد يعيد الجداول المرتبطة كمصفوفة أو كائن
    // سنقوم بفحص الحالتين لضمان ظهور الاسم
    const warehouseObj = order.warehouses;
    const warehouseName = Array.isArray(warehouseObj) 
      ? warehouseObj[0]?.name 
      : warehouseObj?.name;

    return {
      ...order,
      display_date: order.order_date ? new Date(order.order_date).toLocaleDateString() : "No Date",
      status_display: order.order_statuses?.status_name || "Pending",

      customer_name: order.customers?.name || "Unknown Customer",
      // هنا الخلل الذي كان يسبب N/A أو No Warehouse Assigned
      warehouse_name: warehouseName || "Not Assigned", 
      raw_items: order.order_items || []
    };
  });
};



// 2. إنشاء طلب جديد (Order + Items) في عملية واحدة
export const createOrderAction = async (payload) => {
  // 1. إنشاء رأس الطلب (Order Header)
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert([{
  customer_id: payload.customer_id,
  warehouse_id: payload.warehouse_id,
  status_id: payload.status_id || 1, // Default to first status (e.g., "Pending")
  notes: payload.notes,
}])
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Map form items to DB columns
  // NOTE: order_items.product_variant_id FK references products.id despite the misleading name
  const itemsToInsert = payload.items.map((item) => ({
    order_id: orderData.id,
    product_variant_id: item.product_id,
    quantity: item.quantity,
    notes: item.notes,
  }));

  // 3. إدخال كافة العناصر دفعة واحدة
  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsToInsert);

  if (itemsError) throw itemsError;

  return orderData;
};



export const getProductDetails = async (productId) => {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      sku,
      sell_price,
      stock,
      description,
      is_active,
      product_types ( name ),
      product_categories ( name ),
      brands ( name ),
      product_attribute_values (
        value,
        attributes ( name )
      ),
      warehouse_stock (
        quantity,
        warehouses:warehouse_id ( name )
      )
    `)
    .eq("id", productId)
    .single();

  if (error) throw error;

  return data;
};


// export const confirmAndShipOrder = async (orderId, warehouseId, items) => {

//   // استخدام RPC (Stored Procedure) في Supabase هو الأفضل للتعامل مع العمليات المعقدة
//   // ولكن سنقوم بها هنا برمجياً لتبسيط الأمر حالياً
  
//   // 1. تحديث حالة الطلب
//   const { error: updateError } = await supabase
//     .from("orders")
//     .update({ status_id: 2 }) // نفترض أن 2 هي حالة Shipped
//     .eq("id", orderId);

//   if (updateError) throw updateError;

//   // 2. خصم الكميات من المستودع
//   for (const item of items) {
//     // جلب الكمية الحالية أولاً
//     const { data: stockData } = await supabase
//       .from("warehouse_stock")
//       .select("quantity")
//       .eq("warehouse_id", warehouseId)
//       .eq("product_id", item.product_variant_id)
//       .single();

//     if (stockData) {
//       const newQuantity = stockData.quantity - item.quantity;
      
//       await supabase
//         .from("warehouse_stock")
//         .update({ quantity: newQuantity })
//         .eq("warehouse_id", warehouseId)
//         .eq("product_id", item.product_variant_id);
//     }
//   }
  
//   return { success: true };
// };

export const confirmAndShipOrder = async (orderId, warehouseId, items) => {
  // 1. التحقق من توفر الكميات لجميع المنتجات أولاً (Pre-check)
  for (const item of items) {
    const { data: stockData, error: fetchError } = await supabase
      .from("warehouse_stock")
      .select("quantity, products(name)") // جلب اسم المنتج لإظهاره في رسالة الخطأ
      .eq("warehouse_id", warehouseId)
      .eq("product_id", item.product_variant_id)
      .single();

    if (fetchError || !stockData) {
      throw new Error(`Product not found in this warehouse.`);
    }

    if (stockData.quantity < item.quantity) {
      // هنا يتم رفض الشحن وإرسال رسالة واضحة
      throw new Error(
        `Cannot ship! Available stock for"${stockData.products.name}" is (${stockData.quantity}) while the order requires(${item.quantity}).`
      );
    }
  }

  // 2. إذا وصلنا هنا، فهذا يعني أن جميع المنتجات متوفرة. نبدأ بالتحديث:
  
  // تحديث حالة الطلب
  const { error: updateError } = await supabase
    .from("orders")
    .update({ status_id: 2 }) 
    .eq("id", orderId);

  if (updateError) throw updateError;

  // 3. خصم الكميات من المستودع
  for (const item of items) {
    // جلب الكمية الحالية مرة أخرى (لضمان الدقة اللحظية)
    const { data: stockData } = await supabase
      .from("warehouse_stock")
      .select("quantity")
      .eq("warehouse_id", warehouseId)
      .eq("product_id", item.product_variant_id)
      .single();

    const newQuantity = stockData.quantity - item.quantity;
    
    const { error: stockUpdateError } = await supabase
      .from("warehouse_stock")
      .update({ quantity: newQuantity })
      .eq("warehouse_id", warehouseId)
      .eq("product_id", item.product_variant_id);

    if (stockUpdateError) throw stockUpdateError;
  }
  
  return { success: true };
};
