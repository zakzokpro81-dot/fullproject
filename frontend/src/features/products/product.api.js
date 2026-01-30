import supabase from "../../config/supabase";

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      brands(id, name),
      families(id, name),
      models(id, name),
      part_types(id, name)
    `)
    .order("id", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getModelsForProduct() {
  const { data, error } = await supabase
    .from("models")
    .select(`
      id, name, families(id, name, brands(id, name))
    `);

  if (error) throw error;
  return data;
}

export async function createProduct(formData) {
  if (!formData.warehouse_id) {
    throw new Error("Warehouse is required");
  }

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
      part_name: formData.part_name,
      is_active: formData.is_active,
      stock: formData.stock,
    })
    .select()
    .single();

  if (productError) {
    console.error("Product insert error:", productError);
    throw productError;
  }

  const { error: stockError } = await supabase
    .from("warehouse_stock")
    .insert({
      warehouse_id: Number(formData.warehouse_id),
      product_id: product.id,
      quantity: Number(formData.stock),
      product_variant_id: formData.product_variant_id || null,
    });

  if (stockError) {
    console.error("Warehouse stock insert error:", stockError);
    throw stockError;
  }

  return product;
}

export async function updateProduct(id, data) {
  const {
    warehouse_id,
    stock,
    ...productData
  } = data;

  const { error: productError } = await supabase
    .from("products")
    .update({
      ...productData,
      stock: stock,
    })

    .eq("id", id);

  if (productError) throw productError;

  const { error: stockError } = await supabase
    .from("warehouse_stock")
    .update({
      warehouse_id: warehouse_id,
      quantity: stock,
    })
    .eq("product_id", id);

  if (stockError) throw stockError;

  return true;
}

// export async function deleteProduct(id) {
//   const { error } = await supabase
//     .from("products")
//     .delete()
//     .eq("id", id);

//   if (error) throw error;
// }
export async function deleteProduct(id) {
  // 1️⃣ حذف المخزون أولاً
  const { error: stockError } = await supabase
    .from("warehouse_stock")
    .delete()
    .eq("product_id", id);

  if (stockError) throw stockError;

  // 2️⃣ حذف المنتج
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function deleteProducts(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return;

  const numericIds = ids.map(id => Number(id));

  const { error: stockError } = await supabase
    .from("warehouse_stock")
    .delete()
    .in("product_id", numericIds);

  if (stockError) throw stockError;

  const { error: productError } = await supabase
    .from("products")
    .delete()
    .in("id", numericIds);

  if (productError) throw productError;
}



export const createProductWithStock = async (data) => {
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
      part_type_id: data.part_type_id,
      part_name: data.part_name,
      stock: data.stock,
    })
    .select()
    .single();

  if (productError) {
    console.error("Product insert error:", productError);
    throw productError;
  }

  const { error: stockError } = await supabase
    .from("warehouse_stock")
    .insert({
      warehouse_id: data.warehouse_id,
      product_id: product.id,
      product_variant_id: null,
      quantity: data.stock,
    });

  if (stockError) {
    console.error("Warehouse stock insert error:", stockError);
    throw stockError;
  }

  return product;
};
