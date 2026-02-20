import supabase from "../../config/supabase";

// 1. جلب المنتجات مع بيانات المخزن والخصائص
export const getProducts = async ({ page, pageSize, searchText, warehouseId, typeId }) => {
    let query = supabase
        .from("products")
        .select(`
            *,
            product_type:product_types(id, name),
            warehouse_stock (quantity, warehouse:warehouses(id, name)),
            attributes:product_attribute_values(value, attribute:attributes(name))
        `, { count: 'exact' })
        .eq('is_active', true);

    if (searchText) query = query.ilike('name', `%${searchText}%`);
    if (typeId) query = query.eq('product_type_id', typeId);

    // فلترة بناءً على المستودع عبر جدول warehouse_stock
    if (warehouseId) {
        const { data: stockData } = await supabase
            .from('warehouse_stock')
            .select('product_id')
            .eq('warehouse_id', warehouseId);
        
        const ids = stockData?.map(s => s.product_id) || [];
        query = query.in('id', ids.length ? ids : [-1]); 
    }

    const from = page * pageSize;
    const { data, count, error } = await query
        .range(from, from + pageSize - 1)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, count };
};

// 2. إضافة منتج جديد مع "حركة افتتاحية"
export const createProduct = async (formData) => {
    // أ- إدخال المنتج
    const { data: product, error: pError } = await supabase
        .from("products")
        .insert([{
            name: formData.name,
            sku: formData.sku,
            product_type_id: formData.product_type_id,
            cost_price: formData.cost_price,
            sell_price: formData.sell_price,
            description: formData.description,
            stock: 0 // سيتحدث تلقائياً عبر الـ Trigger عند إضافة الحركة
        }])
        .select().single();

    if (pError) throw pError;

    // ب- تسجيل حركة افتتاحية إذا كان هناك كمية أولية
    if (Number(formData.initial_stock) > 0) {
        const { data: type } = await supabase
            .from("stock_movement_types")
            .select("id").eq("movement_name", "Opening Stock").single();

        await supabase.from("stock_movements").insert({
            product_id: product.id,
            quantity: formData.initial_stock,
            warehouse_id: formData.warehouse_id,
            movement_type_id: type?.id,
            reference_type: "Initial Setup"
        });
    }

    // ج- إدخال الخصائص
    if (formData.attributes) {
        const attrPayload = Object.entries(formData.attributes).map(([id, val]) => ({
            product_id: product.id,
            attribute_id: id,
            value: String(val)
        }));
        await supabase.from("product_attribute_values").insert(attrPayload);
    }

    return product;
};