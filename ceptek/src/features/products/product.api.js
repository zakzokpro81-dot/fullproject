import supabase from "../../config/supabase";
import axios from "axios";




export const getProducts = async ({ page, pageSize, searchText, warehouseId, typeId }) => {
    // 1. استعلام المنتجات الأساسي (مستقر ويعمل دائماً)
    let query = supabase
        .from("products")
        .select(`
            *,
            family:families(id, name),
            brand:brands(id, name),
            product_type:product_types(id, name),
            attributes:product_attribute_values(
                id, attribute_id, value,
                attribute:attributes(name, slug)
            ),warehouse_stock (
                quantity,
                warehouse_id,
                warehouse:warehouses(name)
            )
        `, { count: 'exact' });

    if (searchText) query = query.ilike('name', `%${searchText}%`);
    if (typeId && typeId !== "") query = query.eq('product_type_id', typeId);

    // 2. الفلترة باستخدام الجدول الصحيح warehouse_stock
    if (warehouseId && warehouseId !== "") {
    // التحويل لـ Number يضمن أن المقارنة في سوبابيز تتم بشكل صحيح
    const cleanId = Number(warehouseId); 

    const { data: stockData, error: stockError } = await supabase
        .from('warehouse_stock')
        .select('product_id')
        .eq('warehouse_id', cleanId); // تأكد أن warehouse_id في القاعدة نوعه int8 أو integer

        if (stockError) {
            console.error("Stock API Error:", stockError.message);
        }

        if (stockData && stockData.length > 0) {
            const productIds = stockData.map(item => item.product_id);
            query = query.in('id', productIds);
        } else {
            // إذا كان المستودع فارغاً، نرجع نتيجة فارغة فوراً
            return { data: [], count: 0 };
        }
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
        .range(from, to)
        .order('id', { ascending: false });

    if (error) throw error;
    return { data, count };
};




// تعديل دالة جلب المنتجات لتدعم الترقيم والبحث من السيرفر
export const getProducts__without_filtring = async ({ page, pageSize, searchText }) => {
    let query = supabase
        .from("products")
        .select(`
            *,
      family:families(id, name),
      brand:brands(id, name),
      product_type:product_types(id, name),
      attributes:product_attribute_values(
        id,
        attribute_id,
        value,
        attribute:attributes(name, slug)
      )
        
            
        `, { count: 'exact' }); // نطلب من سوبابيز إعطاءنا العدد الإجمالي

    // البحث في السيرفر (إذا وجد نص بحث)
    if (searchText) {
        query = query.ilike('name', `%${searchText}%`);
    }

    // حساب النطاق (Range) المطلوب
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
        .range(from, to)
        .order('id', { ascending: false });

    if (error) throw error;
    return { data, count }; // نعيد البيانات والعدد الإجمالي
};

export async function getProducts__for__all__data() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      family:families(id, name),
      brand:brands(id, name),
      product_type:product_types(id, name),
      attributes:product_attribute_values(
        id,
        attribute_id,
        value,
        attribute:attributes(name, slug)
      )
    `)
    .order("id", { ascending: false });

  if (error) {
    console.error("Fetch error:", error);
    throw error;
  }
  return data;
}



export async function getCategoryByType(typeId) {
  if (!typeId) return null;
  const { data, error } = await supabase
    .from("product_types")
    .select(`
      category:families(id, name) 
    `)
    .eq("id", typeId)
    .single();

  if (error) {
    console.error("Error fetching linked category:", error);
    return null;
  }
  return data?.category;
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
  try {
    console.log("Starting update for ID:", id, "with data:", data);

    // 1. تحديث بيانات المنتج الأساسية (الأسعار، الوصف، النوع، الخ)
    const { error: productError } = await supabase
      .from("products")
      .update({
        name: data.name,
        brand_id: data.brand_id,
        model_id: data.model_id,
        product_type_id: data.product_type_id,
        family_id: data.family_id,
        cost_price: data.cost_price,
        sell_price: data.sell_price,
        stock: Number(data.stock), // تحديث إجمالي المخزن في جدول المنتجات
        description: data.description,
        updated_at: new Date(),
        is_active:data.is_active,
      })
      .eq("id", id);

    if (productError) throw productError;

    // 2. تحديث الـ Attributes (حذف القديم وإضافة الجديد لضمان التطابق)
    await supabase.from("product_attribute_values").delete().eq("product_id", id);

    const attributes = data.attributes || {};
    const attrInserts = [];

    for (let slug in attributes) {
      let val = attributes[slug];
      const finalValue = typeof val === "object" && val !== null ? val.value : val;

      if (finalValue !== undefined && finalValue !== null) {
        const { data: attrInfo } = await supabase
          .from("attributes")
          .select("id")
          .eq("slug", slug)
          .single();

        if (attrInfo) {
          attrInserts.push({
            product_id: id,
            attribute_id: attrInfo.id,
            value: String(finalValue),
          });
        }
      }
    }

    if (attrInserts.length > 0) {
      const { error: insertAttrError } = await supabase
        .from("product_attribute_values")
        .insert(attrInserts);
      if (insertAttrError) throw insertAttrError;
    }

    // 3. تحديث المخزن (تصحيح منطق التكرار)
    // نحدث السجل بناءً على product_id فقط لنغير المستودع (Warehouse_id) والكمية (quantity) معاً
    const { data: updateResult, error: updateError } = await supabase
      .from("warehouse_stock")
      .update({ 
        warehouse_id: data.warehouse_id, // تغيير المستودع هنا يمنع التكرار ويقوم بالنقل
        quantity: Number(data.stock) 
      })
      .eq("product_id", id) // الشرط على المنتج فقط وليس المستودع القديم
      .select();

    if (updateError) {
      console.error("Supabase Warehouse Update Error:", updateError);
      throw updateError;
    }

    // إذا لم يكن للمنتج أي سجل سابق في جدول المخزن (حالة استثنائية)
    if (!updateResult || updateResult.length === 0) {
      console.log("No existing stock record found. Creating new entry...");
      const { error: insertStockError } = await supabase
        .from("warehouse_stock")
        .insert({
          product_id: id,
          warehouse_id: data.warehouse_id,
          quantity: Number(data.stock),
          product_variant_id: null,
        });
      
      if (insertStockError) throw insertStockError;
    }

    console.log("Product and Warehouse transfer completed successfully");
    return true;
  } catch (err) {
    console.error("Final catch Update error:", err);
    throw err;
  }
}


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


export async function saveBulkProducts(productsData) {
  try {
    // 1. تجهيز بيانات المنتجات الأساسية
    const productsToInsert = productsData.map((item) => ({
      name: String(item.name || "Unnamed Product"),
      brand_id: item.brand_id || null,
      model_id: item.model_id || null,
      product_type_id: item.product_type_id || null,
      category_id: item.category_id || null,
      cost_price: Number(item.cost_price) || 0,
      sell_price: Number(item.sell_price) || 0,
      stock: Number(item.stock) || 0,
      description: item.description || "",
      family_id: item.family_id || null,
      is_active: true,
    }));

    // إدراج المنتجات في جدول products
    const { data: insertedProducts, error: productsError } = await supabase
      .from("products")
      .insert(productsToInsert)
      .select();

    if (productsError) throw productsError;

    const attributeValuesToInsert = [];
    const stockEntriesToInsert = [];

    // جلب الـ IDs للخصائص (Attributes) بناءً على الـ Slugs
    const allSlugs = [
      ...new Set(productsData.flatMap((p) => Object.keys(p.attributes || {}))),
    ];
    
    const { data: attributesList, error: attrFetchError } = await supabase
      .from("attributes")
      .select("id, slug")
      .in("slug", allSlugs);

    if (attrFetchError) throw attrFetchError;

    const attrMap = attributesList?.reduce(
      (acc, curr) => ({ ...acc, [curr.slug]: curr.id }),
      {}
    ) || {};

    // 2. ربط البيانات المدرجة بالخصائص والمخزون
    insertedProducts.forEach((product, index) => {
      // نعتمد على الترتيب (Index) لأن سوبابيس يعيد البيانات بنفس ترتيب الإدخال في الـ Bulk
      const originalData = productsData[index];
      if (!originalData) return;

      // أ. تجهيز بيانات المخزون
      if (originalData.warehouse_id) {
        stockEntriesToInsert.push({
          warehouse_id: originalData.warehouse_id,
          product_id: product.id,
          quantity: Number(product.stock) || 0,
          product_variant_id: null,
        });
      }

      // ب. معالجة الخصائص (Attributes) - الفلترة الصارمة لمنع الـ Null
      const attrs = originalData.attributes || {};
      for (let slug in attrs) {
        let rawVal = attrs[slug];
        let finalStringVal = "";

        // فك تشفير القيمة مهما كان نوعها (Object, String, Number)
        if (rawVal !== null && rawVal !== undefined) {
          if (typeof rawVal === "object") {
            if ("value" in rawVal) {
              finalStringVal = String(rawVal.value);
            } else if ("label" in rawVal) {
              finalStringVal = String(rawVal.label);
            }
          } else {
            finalStringVal = String(rawVal);
          }
        }

        const attributeId = attrMap[slug];
        
        // القيد الذهبي: لا تسمح بمرور الصف إذا كانت القيمة فارغة نهائياً
        // هذا يمنع خطأ "null value in column value"
        if (
          attributeId && 
          finalStringVal.trim() !== "" && 
          finalStringVal !== "null" && 
          finalStringVal !== "undefined"
        ) {
          attributeValuesToInsert.push({
            product_id: product.id,
            attribute_id: attributeId,
            value: finalStringVal.trim(),
          });
        }
      }
    });

    // 3. تنفيذ عمليات الإدراج في الجداول الفرعية
    
    // إدراج المخزون
    if (stockEntriesToInsert.length > 0) {
      const { error: stockError } = await supabase
        .from("warehouse_stock")
        .insert(stockEntriesToInsert);
      if (stockError) throw stockError;
    }

    // إدراج الخصائص (Attributes)
    if (attributeValuesToInsert.length > 0) {
      const { error: attrInsertError } = await supabase
        .from("product_attribute_values")
        .insert(attributeValuesToInsert);
      
      if (attrInsertError) {
        console.error("Failed Attribute Payload:", attributeValuesToInsert);
        throw attrInsertError;
      }
    }

    return insertedProducts;
  } catch (err) {
    console.error("Error in Bulk Saving:", err);
    throw err;
  }
}



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
        category_id:data.category_id,
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





export async function getProductAttributes(productId) {
  // جلب كل قيم الاتربيوت المرتبطة بالمنتج
  const { data, error } = await supabase
    .from("product_attribute_values")
    .select("*")
    .eq("product_id", productId);

  if (error) throw new Error(error.message);
  return data; // سيكون مصفوفة من القيم
}



/**
 * جلب سجل المخزن لمنتج معين مع بيانات المستودع المرتبط
 * @param {number} productId - معرف المنتج
 */
export const getProductStockLocation = async (productId) => {
  const { data, error } = await supabase
    .from("warehouse_stock")
    .select(`
      id,
      quantity,
      warehouse_id,
      product_id,
      warehouse:warehouses (
        id,
        name
      )
    `)
    .eq("product_id", productId)
    .maybeSingle(); // نستخدم maybeSingle لأن المنتج قد لا يكون له سجل مخزني بعد

  if (error) {
    console.error("Error fetching stock location:", error);
    throw error;
  }
  return data;
};




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



// Product Types حسب Category
// export const getProductTypes = async (categoryId) => {
//   if (!categoryId) return [];
//   const { data, error } = await supabase
//     .from("product_types")
//     .select("*")
//     .eq("category_id", categoryId)
//     .eq("is_active", true)
//     .order("name");
//   if (error) throw error;
//   return data;
// };


export const getProductTypes = async (categoryId = null, fetchAll = false) => {
  // 1. إذا لم نطلب "جلب الكل" ولم نرسل "رقم تصنيف"، نرجع مصفوفة فارغة (السلوك القديم)
  if (!fetchAll && !categoryId) return [];

  let query = supabase
    .from("product_types")
    .select("*")
    .order("name");

  // 2. الفلترة حسب التصنيف إذا وُجد
  if (categoryId && typeof categoryId !== 'object') {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// // جلب كافة أنواع المنتجات (مثل: قطع غيار، إكسسوارات، إلخ)
// export const getProductTypes = async () => {
//     const { data, error } = await supabase
//         .from("product_types")
//         .select("id, name")
//         .order("name", { ascending: true });

//     if (error) {
//         console.error("Error fetching product types:", error.message);
//         throw error;
//     }
//     return data;
// };


