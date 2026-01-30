import  supabase  from "../../config/supabase";

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      brands(id, name),
      families(id, name),
      models(id, name)
    `)
    .order("id", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getModelsForProduct() {
  const { data, error } = await supabase
    .from("models")
    .select(`
      id,
      name,
      families(
        id,
        name,
        brands(
          id,
          name
        )
      )
    `);

  if (error) throw error;
  return data;
}


export async function createProduct(formData) {
  // تحقق أن warehouse_id موجود
  if (!formData.warehouse_id) {
    throw new Error("Warehouse is required");
  }

  // 1️⃣ إدخال المنتج في جدول products فقط
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name: formData.name,
      brand_id: formData.brand_id,
      family_id: formData.family_id,
      model_id: formData.model_id,
      sku: formData.sku,
      cost_price: formData.cost_price,
      sell_price: formData.sell_price,
      description: formData.description,
      part_type_id: formData.part_type_id,
      is_active: formData.is_active,
    })
    .select()
    .single();

  if (productError) {
    console.error("Product insert error:", productError);
    throw productError;
  }

  // 2️⃣ إدخال المخزون في warehouse_stock
  const { error: stockError } = await supabase
    .from("warehouse_stock")
    .insert({
      warehouse_id: Number(formData.warehouse_id),
      product_id: product.id,
      quantity: Number(formData.quantity),
      product_variant_id: formData.product_variant_id || null,
    });

  if (stockError) {
    console.error("Warehouse stock insert error:", stockError);
    throw stockError;
  }

  return product;
}


export async function updateProduct(id, product) {
  const { data, error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update product error:", error);
    throw error;
  }
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export const createProductWithStock = async (data) => {
  // 1. insert product
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name: data.name,
      brand_id: data.brand_id,
      family_id: data.family_id,
      model_id: data.model_id,
      sell_price: data.sell_price,
      cost_price: data.cost_price,
      is_active: data.is_active,
      description: data.description,
    })
    .select()
    .single();

  if (productError) {
    console.error("Product insert error:", productError);
    throw productError;
  }

  // 2. insert warehouse_stock
  const { error: stockError } = await supabase
    .from("warehouse_stock")
    .insert({
      warehouse_id: data.warehouse_id,
      product_id: product.id,
      product_variant_id: null,
      quantity: data.stock, // ✅ الاسم الصحيح للعمود
    });

  if (stockError) {
    console.error("Warehouse stock insert error:", stockError);
    throw stockError;
  }

  return product;
};
