import supabase from "../../config/supabase";




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
        `, { count: 'exact' })
        .eq('is_active', true);

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


// دالة لجلب الموديلات مع الفلترة حسب نوع المنتج (عن طريق العائلة)
export const getFilteredModels = async (typeId) => {
    // 1. نبدأ بالاستعلام من جدول الموديلات
    // نستخدم !inner مع families لنتمكن من الفلترة عليها
    let query = supabase
        .from("models")
        .select(`
            id,
            name,
            brand:brands(id, name),
            family:families!inner(
                id, 
                name, 
                product_type_id
            )
        `);

    // 2. منطق التصفية: 
    // إذا كان هناك typeId (وليس قطع تبديل - بفرض أن ID قطع التبديل هو 1)
    // ملاحظة: استبدل رقم 1 بـ ID "قطع التبديل" الفعلي عندك إذا كان مختلفاً
    if (typeId && typeId !== 1) {
        query = query.eq('family.product_type_id', typeId);
    }

    const { data, error } = await query.order('name');

    if (error) {
        console.error("Error fetching filtered models:", error.message);
        throw error;
    }

    // 3. تنسيق البيانات لتناسب الـ Autocomplete (Label & ID)
    return data.map(model => ({
        id: model.id,
        label: `${model.brand?.name || 'Unknown'} - ${model.family?.name} - ${model.name}`,
        brand_id: model.brand?.id,
        family_id: model.family?.id,
        model_id: model.id
    }));
};


export async function deactivateProduct(id) {
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);
  if (error) throw error;
  return true;
}

export async function deactivateMultipleProducts(ids) {
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .in("id", ids);
  if (error) throw error;
  return true;
}


export async function softDeleteProduct(id) {
  try {
    const { error } = await supabase
      .from("products")
      .update({ 
        is_active: false,
        updated_at: new Date() 
      })
      .eq("id", id);

    if (error) throw error;
    
    return true; // تعني أن المنتج تم إيقافه بنجاح
  } catch (err) {
    console.error("Error deactivating product:", err.message);
    throw err;
  }
}

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

// export async function createProduct(formData) {
//   if (!formData.warehouse_id) {
//     throw new Error("Warehouse is required");
//   }

//   const { data: product, error: productError } = await supabase
//     .from("products")
//     .insert({
//       name: formData.name,
//       brand_id: formData.brand_id,
//       family_id: formData.family_id,
//       model_id: formData.model_id,
//       sku: formData.sku,
//       cost_price: formData.cost_price,
//       sell_price: formData.sell_price,
//       description: formData.description,
//       part_type_id: formData.part_type_id,
//       part_name: formData.part_name,
//       is_active: formData.is_active,
//       stock: formData.stock,
//     })
//     .select()
//     .single();

//   if (productError) {
//     console.error("Product insert error:", productError);
//     throw productError;
//   }

//   const { error: stockError } = await supabase
//     .from("warehouse_stock")
//     .insert({
//       warehouse_id: Number(formData.warehouse_id),
//       product_id: product.id,
//       quantity: Number(formData.stock),
//       product_variant_id: formData.product_variant_id || null,
//     });

//   if (stockError) {
//     console.error("Warehouse stock insert error:", stockError);
//     throw stockError;
//   }

//   return product;
// } هذه الدالة تعمل بشكل سليم قبل اضافة عملية التعامل مع حركة المخزن 


// export async function updateProduct(id, data) {
//   try {
//     console.log("Starting update for ID:", id, "with data:", data);

//     // 1. تحديث بيانات المنتج الأساسية (الأسعار، الوصف، النوع، الخ)
//     const { error: productError } = await supabase
//       .from("products")
//       .update({
//         name: data.name,
//         brand_id: data.brand_id,
//         model_id: data.model_id,
//         product_type_id: data.product_type_id,
//         family_id: data.family_id,
//         cost_price: data.cost_price,
//         sell_price: data.sell_price,
//         stock: Number(data.stock), // تحديث إجمالي المخزن في جدول المنتجات
//         description: data.description,
//         updated_at: new Date(),
//         is_active:data.is_active,
//       })
//       .eq("id", id);

//     if (productError) throw productError;

//     // 2. تحديث الـ Attributes (حذف القديم وإضافة الجديد لضمان التطابق)
//     await supabase.from("product_attribute_values").delete().eq("product_id", id);

//     const attributes = data.attributes || {};
//     const attrInserts = [];

//     for (let slug in attributes) {
//       let val = attributes[slug];
//       const finalValue = typeof val === "object" && val !== null ? val.value : val;

//       if (finalValue !== undefined && finalValue !== null) {
//         const { data: attrInfo } = await supabase
//           .from("attributes")
//           .select("id")
//           .eq("slug", slug)
//           .single();

//         if (attrInfo) {
//           attrInserts.push({
//             product_id: id,
//             attribute_id: attrInfo.id,
//             value: String(finalValue),
//           });
//         }
//       }
//     }

//     if (attrInserts.length > 0) {
//       const { error: insertAttrError } = await supabase
//         .from("product_attribute_values")
//         .insert(attrInserts);
//       if (insertAttrError) throw insertAttrError;
//     }

//     // 3. تحديث المخزن (تصحيح منطق التكرار)
//     // نحدث السجل بناءً على product_id فقط لنغير المستودع (Warehouse_id) والكمية (quantity) معاً
//     const { data: updateResult, error: updateError } = await supabase
//       .from("warehouse_stock")
//       .update({ 
//         warehouse_id: data.warehouse_id, // تغيير المستودع هنا يمنع التكرار ويقوم بالنقل
//         quantity: Number(data.stock) 
//       })
//       .eq("product_id", id) // الشرط على المنتج فقط وليس المستودع القديم
//       .select();

//     if (updateError) {
//       console.error("Supabase Warehouse Update Error:", updateError);
//       throw updateError;
//     }

//     // إذا لم يكن للمنتج أي سجل سابق في جدول المخزن (حالة استثنائية)
//     if (!updateResult || updateResult.length === 0) {
//       console.log("No existing stock record found. Creating new entry...");
//       const { error: insertStockError } = await supabase
//         .from("warehouse_stock")
//         .insert({
//           product_id: id,
//           warehouse_id: data.warehouse_id,
//           quantity: Number(data.stock),
//           product_variant_id: null,
//         });
      
//       if (insertStockError) throw insertStockError;
//     }

//     console.log("Product and Warehouse transfer completed successfully");
//     return true;
//   } catch (err) {
//     console.error("Final catch Update error:", err);
//     throw err;
//   }
// } هذه الدالة تعمل بشكل سليم قبل اضافة عملية التعامل مع حركة المخزن 

export async function createProduct(formData) {
  if (!formData.warehouse_id) {
    throw new Error("Warehouse is required");
  }

  // 1️⃣ إدراج المنتج في جدول products
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
      product_type_id: formData.product_type_id, // تأكد من الاسم الصحيح للحقل
      is_active: formData.is_active,
      stock: 0, // سنجعله 0 لأن الحركة المخزنية هي من ستقوم بتحديثه عبر الـ Trigger
    })
    .select()
    .single();

  if (productError) throw productError;

  // 2️⃣ جلب ID نوع الحركة "Opening Stock" من القاموس
  const { data: typeData } = await supabase
    .from("stock_movement_types")
    .select("id")
    .eq("movement_name", "Opening Stock")
    .single();

  // 3️⃣ تسجيل الحركة المخزنية (هذا ما سيقوم الـ Trigger بالتقاطه لتحديث warehouse_stock و products.stock)
  if (Number(formData.stock) > 0) {
    const { error: movementError } = await supabase
      .from("stock_movements")
      .insert({
        product_id: product.id,
        quantity: Number(formData.stock),
        warehouse_id: Number(formData.warehouse_id),
        movement_type_id: typeData?.id,
        reference_type: "Product Creation",
        reference_id: product.id
      });

    if (movementError) {
        console.error("Movement Logging Error:", movementError);
        // ملاحظة: لا نتوقف هنا لأن المنتج تم إنشاؤه بالفعل، لكن يفضل معالجة الخطأ
    }
  }

  return product;
}

// export async function updateProduct(id, data) {
//   try {
//     // 1️⃣ جلب الكمية الحالية قبل التحديث للمقارنة
//     const { data: oldProduct } = await supabase
//       .from("products")
//       .select("stock")
//       .eq("id", id)
//       .single();

//     // 2️⃣ تحديث بيانات المنتج (باستثناء الـ stock حالياً لنعالجه عبر الحركة)
//     const { error: productError } = await supabase
//       .from("products")
//       .update({
//         name: data.name,
//         brand_id: data.brand_id,
//         model_id: data.model_id,
//         product_type_id: data.product_type_id,
//         family_id: data.family_id,
//         cost_price: data.cost_price,
//         sell_price: data.sell_price,
//         description: data.description,
//         is_active: data.is_active,
//         updated_at: new Date(),
//       })
//       .eq("id", id);

//     if (productError) throw productError;

//     // 3️⃣ إذا تغيرت الكمية، نسجل حركة "Inventory Adjustment"
//     const newStock = Number(data.stock);
//     const diff = newStock - (oldProduct?.stock || 0);

//     if (diff !== 0) {
//       const { data: typeData } = await supabase
//         .from("stock_movement_types")
//         .select("id")
//         .eq("movement_name", "Inventory Adjustment")
//         .single();

//       await supabase.from("stock_movements").insert({
//         product_id: id,
//         quantity: diff, // الفرق (سواء موجب أو سالب)
//         warehouse_id: data.warehouse_id,
//         movement_type_id: typeData?.id,
//         reference_type: "Manual Update"
//       });
//     }

//     // 4️⃣ تحديث الـ Attributes (كما في كودك الأصلي)
//     await supabase.from("product_attribute_values").delete().eq("product_id", id);
//     // ... (بقية كود الـ attributes الموجود لديك) ...

//     return true;
//   } catch (err) {
//     console.error("Update error:", err);
//     throw err;
//   }
// }// هذه الدالة تعمل قبل اضافة حركة المواد 



export async function updateProduct(id, data) {
  try {
    // 1️⃣ جلب الكمية القديمة بدقة من قاعدة البيانات قبل أي شيء
    const { data: oldProduct } = await supabase
      .from("products")
      .select("stock")
      .eq("id", id)
      .single();

    // 2️⃣ تحديث بيانات المنتج (حذفنا سطر stock من هنا تماماً)
    // دع الـ Trigger هو من يغير الرقم بناءً على الحركة فقط
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
        description: data.description,
        is_active: data.is_active,
        updated_at: new Date(),
        // ❌ حذفنا stock: data.stock من هنا لمنع التضارب
      })
      .eq("id", id);

    if (productError) throw productError;

    // 3️⃣ حساب الفرق وتسجيل الحركة (المنطق المحاسبي)
    const newStockValue = Number(data.stock);
    const oldStockValue = Number(oldProduct?.stock || 0);
    const diff = newStockValue - oldStockValue;

    if (diff !== 0) {
      const { data: typeData } = await supabase
        .from("stock_movement_types")
        .select("id")
        .eq("movement_name", "Inventory Adjustment")
        .single();

      if (typeData) {
        // بمجرد إدخال هذا السطر، الـ Trigger في قاعدة البيانات سيحدث حقل stock تلقائياً
        await supabase.from("stock_movements").insert({
          product_id: id,
          quantity: diff,
          warehouse_id: data.warehouse_id,
          movement_type_id: typeData.id,
          reference_type: "Manual Update",
          reference_id: id
        });
      }
    }

    // 4️⃣ تحديث الخصائص (كودك المستقر كما هو)
    await supabase.from("product_attribute_values").delete().eq("product_id", id);

    if (data.attributes) {
      const attributeValuesToInsert = [];
      if (!Array.isArray(data.attributes)) {
        const allSlugs = Object.keys(data.attributes);
        const { data: attributesList } = await supabase.from("attributes").select("id, slug").in("slug", allSlugs);
        const attrMap = attributesList?.reduce((acc, curr) => ({ ...acc, [curr.slug]: curr.id }), {}) || {};

        for (let slug in data.attributes) {
          let rawVal = data.attributes[slug];
          let finalStringVal = typeof rawVal === "object" ? (rawVal.value || rawVal.label || "") : String(rawVal);
          if (attrMap[slug] && finalStringVal.trim() !== "") {
            attributeValuesToInsert.push({
              product_id: id,
              attribute_id: attrMap[slug],
              value: finalStringVal.trim(),
            });
          }
        }
      } else {
        data.attributes.forEach(attr => {
          if (attr.attribute_id && attr.value) {
            attributeValuesToInsert.push({
              product_id: id,
              attribute_id: attr.attribute_id,
              value: String(attr.value).trim(),
            });
          }
        });
      }

      if (attributeValuesToInsert.length > 0) {
        await supabase.from("product_attribute_values").insert(attributeValuesToInsert);
      }
    }

    return true;
  } catch (err) {
    console.error("Update error detailed:", err);
    throw err;
  }
}

export async function adjustProductStock(id, data) {
  try {
    // 1. حساب الفرق (Diff)
    const { data: currentProduct, error: fetchError } = await supabase
      .from("products")
      .select("stock")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const diff = Number(data.newQuantity) - Number(currentProduct?.stock || 0);
    if (diff === 0) return true;

    // 2. جلب ID نوع الحركة (بدون تعقيد البحث عن "in/out")
    // سنجلب أول نوع متاح في الجدول لضمان نجاح العملية برمجياً الآن
    const { data: types } = await supabase.from("stock_movement_types").select("id").limit(1);
    
    // إذا لم نجد أي نوع في الجدول، سنعطي رقم 1 كافتراضي (أو ارفض العملية)
    const finalTypeId = types && types.length > 0 ? types[0].id : 1;

    // 3. تنفيذ الإدراج (هنا مربط الفرس)
    const { error: insertError } = await supabase.from("stock_movements").insert({
      product_id: id,
      quantity: diff,
      warehouse_id: data.warehouse_id, // تأكد أن هذه القيمة تصل (مثلاً: 1)
      movement_type_id: finalTypeId,
      reference_type: "Manual Adjustment",
      description: data.reason || "Manual Stock Adjustment"
    });

    if (insertError) {
       console.error("Supabase Insert Error:", insertError);
       throw insertError;
    }

    return true; // نجاح العملية -> سيؤدي لـ onSuccess وإغلاق الديالوغ
  } catch (err) {
    console.error("Critical Error in adjustProductStock:", err.message);
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


// export async function saveBulkProducts(productsData) {
//   try {
//     // 1. تجهيز بيانات المنتجات الأساسية
//     const productsToInsert = productsData.map((item) => ({
//       name: String(item.name || "Unnamed Product"),
//       brand_id: item.brand_id || null,
//       model_id: item.model_id || null,
//       product_type_id: item.product_type_id || null,
//       category_id: item.category_id || null,
//       cost_price: Number(item.cost_price) || 0,
//       sell_price: Number(item.sell_price) || 0,
//       stock: Number(item.stock) || 0,
//       description: item.description || "",
//       family_id: item.family_id || null,
//       is_active: true,
//     }));

//     // إدراج المنتجات في جدول products
//     const { data: insertedProducts, error: productsError } = await supabase
//       .from("products")
//       .insert(productsToInsert)
//       .select();

//     if (productsError) throw productsError;

//     const attributeValuesToInsert = [];
//     const stockEntriesToInsert = [];

//     // جلب الـ IDs للخصائص (Attributes) بناءً على الـ Slugs
//     const allSlugs = [
//       ...new Set(productsData.flatMap((p) => Object.keys(p.attributes || {}))),
//     ];
    
//     const { data: attributesList, error: attrFetchError } = await supabase
//       .from("attributes")
//       .select("id, slug")
//       .in("slug", allSlugs);

//     if (attrFetchError) throw attrFetchError;

//     const attrMap = attributesList?.reduce(
//       (acc, curr) => ({ ...acc, [curr.slug]: curr.id }),
//       {}
//     ) || {};

//     // 2. ربط البيانات المدرجة بالخصائص والمخزون
//     insertedProducts.forEach((product, index) => {
//       // نعتمد على الترتيب (Index) لأن سوبابيس يعيد البيانات بنفس ترتيب الإدخال في الـ Bulk
//       const originalData = productsData[index];
//       if (!originalData) return;

//       // أ. تجهيز بيانات المخزون
//       if (originalData.warehouse_id) {
//         stockEntriesToInsert.push({
//           warehouse_id: originalData.warehouse_id,
//           product_id: product.id,
//           quantity: Number(product.stock) || 0,
//           product_variant_id: null,
//         });
//       }

//       // ب. معالجة الخصائص (Attributes) - الفلترة الصارمة لمنع الـ Null
//       const attrs = originalData.attributes || {};
//       for (let slug in attrs) {
//         let rawVal = attrs[slug];
//         let finalStringVal = "";

//         // فك تشفير القيمة مهما كان نوعها (Object, String, Number)
//         if (rawVal !== null && rawVal !== undefined) {
//           if (typeof rawVal === "object") {
//             if ("value" in rawVal) {
//               finalStringVal = String(rawVal.value);
//             } else if ("label" in rawVal) {
//               finalStringVal = String(rawVal.label);
//             }
//           } else {
//             finalStringVal = String(rawVal);
//           }
//         }

//         const attributeId = attrMap[slug];
        
//         // القيد الذهبي: لا تسمح بمرور الصف إذا كانت القيمة فارغة نهائياً
//         // هذا يمنع خطأ "null value in column value"
//         if (
//           attributeId && 
//           finalStringVal.trim() !== "" && 
//           finalStringVal !== "null" && 
//           finalStringVal !== "undefined"
//         ) {
//           attributeValuesToInsert.push({
//             product_id: product.id,
//             attribute_id: attributeId,
//             value: finalStringVal.trim(),
//           });
//         }
//       }
//     });

//     // 3. تنفيذ عمليات الإدراج في الجداول الفرعية
    
//     // إدراج المخزون
//     if (stockEntriesToInsert.length > 0) {
//       const { error: stockError } = await supabase
//         .from("warehouse_stock")
//         .insert(stockEntriesToInsert);
//       if (stockError) throw stockError;
//     }

//     // إدراج الخصائص (Attributes)
//     if (attributeValuesToInsert.length > 0) {
//       const { error: attrInsertError } = await supabase
//         .from("product_attribute_values")
//         .insert(attributeValuesToInsert);
      
//       if (attrInsertError) {
//         console.error("Failed Attribute Payload:", attributeValuesToInsert);
//         throw attrInsertError;
//       }
//     }

//     return insertedProducts;
//   } catch (err) {
//     console.error("Error in Bulk Saving:", err);
//     throw err;
//   }
// } هذه الدالة تعمل بشكل سليم قبل اضافة عملية التعامل مع حركة المخزن 



export async function saveBulkProducts(productsData) {
  try {
    // 1. تجهيز بيانات المنتجات الأساسية (نضع stock = 0 لأن الحركة ستحدثه)
    const productsToInsert = productsData.map((item) => ({
      name: String(item.name || "Unnamed Product"),
      brand_id: item.brand_id || null,
      model_id: item.model_id || null,
      product_type_id: item.product_type_id || null,
      category_id: item.category_id || null,
      cost_price: Number(item.cost_price) || 0,
      sell_price: Number(item.sell_price) || 0,
      stock: 0, // صفر مؤقتاً
      description: item.description || "",
      family_id: item.family_id || null,
      is_active: true,
    }));

    // إدراج المنتجات
    const { data: insertedProducts, error: productsError } = await supabase
      .from("products")
      .insert(productsToInsert)
      .select();

    if (productsError) throw productsError;

    // 2. جلب ID نوع الحركة "Opening Stock"
    const { data: typeData } = await supabase
      .from("stock_movement_types")
      .select("id")
      .eq("movement_name", "Opening Stock")
      .single();

    const movementsToInsert = [];
    const attributeValuesToInsert = [];

    // جلب الـ IDs للخصائص (كما في كودك السابق)
    const allSlugs = [...new Set(productsData.flatMap((p) => Object.keys(p.attributes || {})))];
    const { data: attributesList } = await supabase.from("attributes").select("id, slug").in("slug", allSlugs);
    const attrMap = attributesList?.reduce((acc, curr) => ({ ...acc, [curr.slug]: curr.id }), {}) || {};

    // 3. ربط البيانات المدرجة بالحركات والخصائص
    insertedProducts.forEach((product, index) => {
      const originalData = productsData[index];
      if (!originalData) return;

      // أ. تجهيز "الحركة المخزنية" لكل منتج (هذا بديل للإدراج المباشر في warehouse_stock)
      if (originalData.warehouse_id && Number(originalData.stock) > 0) {
        movementsToInsert.push({
          product_id: product.id,
          quantity: Number(originalData.stock),
          warehouse_id: originalData.warehouse_id,
          movement_type_id: typeData.id,
          reference_type: "Bulk Import",
          reference_id: product.id
        });
      }

      // ب. معالجة الخصائص (نفس منطق كودك المستقر)
      const attrs = originalData.attributes || {};
      for (let slug in attrs) {
        let finalStringVal = "";
        let rawVal = attrs[slug];
        if (rawVal !== null && rawVal !== undefined) {
          finalStringVal = typeof rawVal === "object" ? (rawVal.value || rawVal.label || "") : String(rawVal);
        }
        
        if (attrMap[slug] && finalStringVal.trim() !== "") {
          attributeValuesToInsert.push({
            product_id: product.id,
            attribute_id: attrMap[slug],
            value: finalStringVal.trim(),
          });
        }
      }
    });

    // 4. تنفيذ عمليات الإدراج الجماعي (Bulk)
    
    // إدراج الحركات (الـ Trigger سيعمل الآن ويحدث warehouse_stock و products.stock تلقائياً)
    if (movementsToInsert.length > 0) {
      const { error: movError } = await supabase.from("stock_movements").insert(movementsToInsert);
      if (movError) throw movError;
    }

    // إدراج الخصائص
    if (attributeValuesToInsert.length > 0) {
      const { error: attrInsertError } = await supabase.from("product_attribute_values").insert(attributeValuesToInsert);
      if (attrInsertError) throw attrInsertError;
    }

    return insertedProducts;
  } catch (err) {
    console.error("Error in Bulk Saving:", err);
    throw err;
  }
}

// export async function saveProduct(data) {
//   try {
//     // 1. إدراج المنتج العام في جدول products
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
//         category_id:data.category_id,
//         description: data.description,
//         family_id: data.family_id,
//         is_active: true,
//       })
//       .select()
//       .single();

//     if (productError) throw productError;

//     const productId = product.id;

//     // 2. إدراج Attributes في جدول product_attribute_values
//     const attributes = data.attributes || {};

//     for (let slug in attributes) {
//       let value = attributes[slug];

//       // إذا كانت القيمة كائن {id, value, slug} نأخذ value.value
//       if (typeof value === "object" && value !== null && "value" in value) {
//         value = value.value;
//       }

//       // جلب الـ attribute_id من جدول attributes
//       const { data: attrData, error: attrError } = await supabase
//         .from("attributes")
//         .select("id")
//         .eq("slug", slug)
//          .maybeSingle(); 

//       if (attrError) throw attrError;

//       await supabase.from("product_attribute_values").insert({
//         product_id: productId,
//         attribute_id: attrData.id,
//         value: value, // الآن القيمة ستُخزن كنص فقط
//       });
//     }

//        // 3. إدراج في warehouse_stock
//      const { error: stockError } = await supabase
//     .from("warehouse_stock")
//     .insert({
//       warehouse_id: data.warehouse_id,
//       product_id: product.id,
//       product_variant_id: null,
//       quantity: data.stock,
//     });

//   if (stockError) {
//     console.error("Warehouse stock insert error:", stockError);
//     throw stockError;
//   }



//     return product;
//   } catch (err) {
//     console.error("Error saving product:", err);
//     throw err;
//   }




   

// } شغالة قبل اضافة حركة المواد 

export async function saveProduct(data) {
  try {
    // 1. إدراج المنتج العام في جدول products
    // ملاحظة: جعلنا الـ stock يبدأ بـ 0 لأن الحركة المخزنية ستحدثه عبر الـ Trigger لاحقاً
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name: data.name,
        brand_id: data.brand_id,
        model_id: data.model_id,
        product_type_id: data.product_type_id,
        cost_price: data.cost_price,
        sell_price: data.sell_price,
        stock: 0, // نضعه 0 هنا ليتولى الـ Trigger تحديثه من خلال الحركة
        category_id: data.category_id,
        description: data.description,
        family_id: data.family_id,
        is_active: true,
      })
      .select()
      .single();

    if (productError) throw productError;

    const productId = product.id;

    // 2. إدراج Attributes (بقي كما هو دون تغيير)
    const attributes = data.attributes || {};
    for (let slug in attributes) {
      let value = attributes[slug];
      if (typeof value === "object" && value !== null && "value" in value) {
        value = value.value;
      }

      const { data: attrData, error: attrError } = await supabase
        .from("attributes")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (attrError) throw attrError;

      if (attrData) {
        await supabase.from("product_attribute_values").insert({
          product_id: productId,
          attribute_id: attrData.id,
          value: value,
        });
      }
    }

    // 3. جلب ID نوع الحركة "Opening Stock" (إضافة ضرورية)
    const { data: typeData } = await supabase
      .from("stock_movement_types")
      .select("id")
      .eq("movement_name", "Opening Stock")
      .single();

    // 4. تسجيل الحركة في جدول stock_movements (هذا ما كان ينقصك لتظهر البيانات)
    if (Number(data.stock) > 0) {
      const { error: movementError } = await supabase
        .from("stock_movements")
        .insert({
          product_id: productId,
          quantity: Number(data.stock),
          warehouse_id: data.warehouse_id,
          movement_type_id: typeData?.id,
          reference_type: "Opening Balance"
        });

      if (movementError) {
        console.error("Error creating stock movement:", movementError.message);
        // لا نريد تعطيل العملية كاملة إذا فشل تسجيل الحركة، لكن نفضل معرفة الخطأ
      }
    }

    // ملاحظة: لم نعد بحاجة للإدراج اليدوي في warehouse_stock هنا 
    // لأن الـ Trigger الذي أنشأناه في قاعدة البيانات سيقوم بذلك تلقائياً بمجرد إدراج الحركة أعلاه.

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


