import supabase from "../../config/supabase";
import axios from "axios";

// export async function getProducts() {
//   const { data, error } = await supabase
//     .from("products")
//     .select(`
//       *
     
//     `)
//     .order("id", { ascending: false });

//   if (error) console.log("my error is ", error);
//   return data;
// }

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
       product_type:product_types(id, name),
      attributes:product_attribute_values(
        id,
        attribute_id,
        value,
        attribute:attributes(name)
      )
    `)
    .order("id", { ascending: false });

  if (error) {
    console.log("my error is ", error);
  }

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





// Categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from("product_categories")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return data;
};

// Product Types حسب Category
export const getProductTypes = async (categoryId) => {
  if (!categoryId) return [];
  const { data, error } = await supabase
    .from("product_types")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return data;
};

// Brands
export const getBrands = async () => {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return data;
};

// Families حسب Brand و Product Type
export const getFamilies = async (brandId, productTypeId) => {
  if (!brandId || !productTypeId) return [];
  const { data, error } = await supabase
    .from("families")
    .select("*")
    .eq("brand", brandId)
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return data;
};

// Models حسب Family
export const getModels = async (familyId) => {
  if (!familyId) return [];
  const { data, error } = await supabase
    .from("models")
    .select("*")
    .eq("family", familyId)
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return data;
};

// Attributes حسب Product Type
// export const getAttributes = async (productTypeId) => {
//   if (!productTypeId) return [];
//   const { data, error } = await supabase
//     .from("product_type_attributes")
//     .select(`attribute:id,name`)
//     .eq("product_type_id", productTypeId);
//   if (error) throw error;
//   return data.map(item => item.attribute);
// };



export async function getAttributes(productTypeId) {
  if (!productTypeId) return [];

  // جلب الـ Attributes المرتبطة بالـ Product Type
  const { data: typeAttrs, error: typeAttrsError } = await supabase
    .from("product_type_attributes")
    .select(`
      attributes (
        id,
        name,
        slug,
        data_type,
        has_options,
        is_active
      )
    `)
    .eq("product_type_id", productTypeId)
    .eq("attributes.is_active", true);

  if (typeAttrsError) throw typeAttrsError;

  // جلب الخيارات لكل Attribute له خيارات
  const attributes = await Promise.all(
    typeAttrs.map(async (ta) => {
      const attr = ta.attributes;

      if (attr.has_options) {
        const { data: options, error: optionsError } = await supabase
          .from("attribute_options")
          .select("id,value,slug")
          .eq("attribute_id", attr.id);

        if (optionsError) throw optionsError;
        return { ...attr, options: options || [] };
      } else {
        return { ...attr, options: [] };
      }
    })
  );

  return attributes;
}



// product.api.js

// export async function saveProduct(data) {
//   try {
//     // 1. إدراج المنتج العام
//     const { data: product, error: productError } = await supabase
//       .from("products")
//       .insert({
//         name: data.name,
//         brand_id: data.brand_id,
//         model_id: data.model_id,
//         product_type_id: data.product_type_id,
//         cost_price: data.cost_price,
//         sell_price: data.sell_price,
//         stock: data.stock,
//         description: data.description,
//         family_id: data.family_id,
//         is_active: true,
//       })
//       .select()
//       .single();

//     if (productError) throw productError;

//     const productId = product.id;

//     // 2. إدراج Attributes
//     const attributes = data.attributes || {};

//     for (let slug in attributes) {
//       const value = attributes[slug];

//       // جلب الـ attribute_id من جدول attributes
//       const { data: attrData, error: attrError } = await supabase
//         .from("attributes")
//         .select("id")
//         .eq("slug", slug)
//         .single();

//       if (attrError) throw attrError;

//       await supabase.from("product_attribute_values").insert({
//         product_id: productId,
//         attribute_id: attrData.id,
//         value: value,
//       });
//     }

//     return product;
//   } catch (err) {
//     console.error("Error saving product:", err);
//     throw err;
//   }
// }


export async function saveProduct(data) {
  try {
    // 1. إدراج المنتج العام في جدول products
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name: data.name,
        brand_id: data.brand_id,
        model_id: data.model_id,
        product_type_id: data.product_type_id,
        cost_price: data.cost_price,
        sell_price: data.sell_price,
        stock: data.stock,
        description: data.description,
        family_id: data.family_id,
        is_active: true,
      })
      .select()
      .single();

    if (productError) throw productError;

    const productId = product.id;

    // 2. إدراج Attributes في جدول product_attribute_values
    const attributes = data.attributes || {};

    for (let slug in attributes) {
      let value = attributes[slug];

      // إذا كانت القيمة كائن {id, value, slug} نأخذ value.value
      if (typeof value === "object" && value !== null && "value" in value) {
        value = value.value;
      }

      // جلب الـ attribute_id من جدول attributes
      const { data: attrData, error: attrError } = await supabase
        .from("attributes")
        .select("id")
        .eq("slug", slug)
         .maybeSingle(); 

      if (attrError) throw attrError;

      await supabase.from("product_attribute_values").insert({
        product_id: productId,
        attribute_id: attrData.id,
        value: value, // الآن القيمة ستُخزن كنص فقط
      });
    }

       // 3. إدراج في warehouse_stock
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
  } catch (err) {
    console.error("Error saving product:", err);
    throw err;
  }




   

}



// product.api.js
export async function getWarehouses() {
  const { data, error } = await supabase
    .from("warehouses")   // اسم جدول المستودعات
    .select("id, name")   // فقط نحتاج id و name للعرض
    .order("id", { ascending: true });

  if (error) {
    console.error("Failed to fetch warehouses:", error);
    return [];
  }

  return data;
}



export async function getProductAttributes(productId) {
  // جلب كل قيم الاتربيوت المرتبطة بالمنتج
  const { data, error } = await supabase
    .from("product_attribute_values")
    .select("*")
    .eq("product_id", productId);

  if (error) throw new Error(error.message);
  return data; // سيكون مصفوفة من القيم
}


