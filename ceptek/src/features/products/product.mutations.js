import supabase from "../../config/supabase";

/**
 * Create a product with stock entry.
 */
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
      stock: data.stock,
    })
    .select()
    .single();

  if (productError) {
    console.error("Product insert error:", productError);
    throw productError;
  }

  const { error: stockError } = await supabase.from("warehouse_stock").insert({
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

/**
 * Save a single product with display name, attributes, units, and stock movement.
 */
export async function saveProduct(data) {
  try {
    // Build display name dynamically
    let displayNameParts = [data.name];

    if (data.attributes) {
      Object.values(data.attributes).forEach((attr) => {
        let val = "";
        if (typeof attr === "object" && attr !== null) {
          val = attr.value || attr.name;
        } else {
          val = attr;
        }
        if (val && val.trim !== "" && val !== "undefined") {
          displayNameParts.push(val);
        }
      });
    }

    const finalDisplayName = displayNameParts.join(" ").trim();

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name: data.name,
        display_name: finalDisplayName,
        brand_id: data.brand_id,
        model_id: data.model_id,
        product_type_id: data.product_type_id,
        cost_price: data.cost_price,
        sell_price: data.sell_price,
        stock: 0,
        category_id: data.category_id,
        description: data.description,
        family_id: data.family_id,
        is_active: true,
      })
      .select()
      .single();

    if (productError) throw productError;

    const productId = product.id;

    // Insert attributes
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
          value: typeof value === "string" ? value.trim() : String(value ?? ""),
        });
      }
    }

    // Insert product units (IMEI / Serial)
    if (data.units && data.units.length > 0) {
      const unitsToInsert = data.units.map((unit) => ({
        product_id: productId,
        imei: unit.imei || null,
        serial_number: unit.serial_number || null,
        warehouse_id: data.warehouse_id || unit.warehouse_id,
        status: "available",
        purchase_price: data.cost_price,
        sell_price: data.sell_price,
      }));

      const { error: unitsError } = await supabase
        .from("product_units")
        .insert(unitsToInsert);

      if (unitsError) throw unitsError;
    }

    // Create opening stock movement
    const { data: typeData } = await supabase
      .from("stock_movement_types")
      .select("id")
      .eq("movement_name", "Opening Stock")
      .single();

    if (Number(data.stock) > 0) {
      const { error: movementError } = await supabase
        .from("stock_movements")
        .insert({
          product_id: productId,
          quantity: Number(data.stock),
          warehouse_id: data.warehouse_id,
          movement_type_id: typeData?.id,
          reference_type: "Opening Balance",
        });

      if (movementError) {
        console.error(
          "Error creating stock movement:",
          movementError.message,
        );
      }
    }

    return product;
  } catch (err) {
    console.error("Error saving product:", err);
    throw err;
  }
}

/**
 * Update a product: data, stock movement, and attributes.
 */
export async function updateProduct(id, data) {
  try {
    const { data: oldProduct } = await supabase
      .from("products")
      .select("stock")
      .eq("id", id)
      .single();

    const { error: productError } = await supabase
      .from("products")
      .update({
        name: data.name,
        brand_id: data.brand_id,
        model_id: data.model_id,
        product_type_id: data.product_type_id,
        family_id: data.family_id,
        category_id: data.category_id,
        cost_price: data.cost_price,
        sell_price: data.sell_price,
        description: data.description,
        is_active: data.is_active,
        updated_at: new Date(),
      })
      .eq("id", id);

    if (productError) throw productError;

    // Stock movement if quantity changed
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
        await supabase.from("stock_movements").insert({
          product_id: id,
          quantity: diff,
          warehouse_id: data.warehouse_id,
          movement_type_id: typeData.id,
          reference_type: "Manual Update",
          reference_id: id,
        });
      }
    }

    // Replace attributes
    await supabase
      .from("product_attribute_values")
      .delete()
      .eq("product_id", id);

    if (data.attributes) {
      const attributeValuesToInsert = [];
      if (!Array.isArray(data.attributes)) {
        const allSlugs = Object.keys(data.attributes);
        const { data: attributesList } = await supabase
          .from("attributes")
          .select("id, slug")
          .in("slug", allSlugs);
        const attrMap =
          attributesList?.reduce(
            (acc, curr) => ({ ...acc, [curr.slug]: curr.id }),
            {},
          ) || {};

        for (let slug in data.attributes) {
          let rawVal = data.attributes[slug];
          let finalStringVal =
            typeof rawVal === "object"
              ? rawVal.value || rawVal.label || ""
              : String(rawVal);
          if (attrMap[slug] && finalStringVal.trim() !== "") {
            attributeValuesToInsert.push({
              product_id: id,
              attribute_id: attrMap[slug],
              value: finalStringVal.trim(),
            });
          }
        }
      } else {
        data.attributes.forEach((attr) => {
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
        await supabase
          .from("product_attribute_values")
          .insert(attributeValuesToInsert);
      }
    }

    return true;
  } catch (err) {
    console.error("Update error detailed:", err);
    throw err;
  }
}

/**
 * Adjust product stock via stock movement.
 */
export async function adjustProductStock(id, data) {
  try {
    const { data: currentProduct, error: fetchError } = await supabase
      .from("products")
      .select("stock")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const diff = Number(data.newQuantity) - Number(currentProduct?.stock || 0);
    if (diff === 0) return true;

    const { data: types } = await supabase
      .from("stock_movement_types")
      .select("id")
      .limit(1);
    const finalTypeId = types && types.length > 0 ? types[0].id : 1;

    const { error: insertError } = await supabase
      .from("stock_movements")
      .insert({
        product_id: id,
        quantity: diff,
        warehouse_id: data.warehouse_id,
        movement_type_id: finalTypeId,
        reference_type: "Manual Adjustment",
        description: data.reason || "Manual Stock Adjustment",
      });

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      throw insertError;
    }

    return true;
  } catch (err) {
    console.error("Critical Error in adjustProductStock:", err.message);
    throw err;
  }
}

/**
 * Hard-delete a single product (removes stock first).
 */
export async function deleteProduct(id) {
  const { error: stockError } = await supabase
    .from("warehouse_stock")
    .delete()
    .eq("product_id", id);
  if (stockError) throw stockError;

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Hard-delete multiple products by IDs.
 */
export async function deleteProducts(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return;
  const numericIds = ids.map((id) => Number(id));

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

/**
 * Soft-delete a single product (set is_active = false).
 */
export async function softDeleteProduct(id) {
  const { error } = await supabase
    .from("products")
    .update({ is_active: false, updated_at: new Date() })
    .eq("id", id);
  if (error) throw error;
  return true;
}

/**
 * Deactivate a single product.
 */
export async function deactivateProduct(id) {
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);
  if (error) throw error;
  return true;
}

/**
 * Deactivate multiple products.
 */
export async function deactivateMultipleProducts(ids) {
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .in("id", ids);
  if (error) throw error;
  return true;
}

/**
 * Bulk-create products with display names, stock movements, units, and attributes.
 */
export async function saveBulkProducts(productsData) {
  try {
    const productsToInsert = productsData.map((item) => {
      const attrs = item.attributes || {};
      const specs = Object.values(attrs)
        .map((attr) => {
          if (typeof attr === "object" && attr !== null) {
            return attr.label || attr.value || attr.name || "";
          }
          return String(attr || "");
        })
        .filter((val) => val.trim() !== "" && val !== "undefined");

      const modelName = String(item.name || "Unnamed Product");
      const fullDisplayName =
        specs.length > 0
          ? `${modelName} ${specs.join(" ")}`.trim()
          : modelName;

      return {
        name: modelName,
        display_name: fullDisplayName,
        brand_id: item.brand_id || null,
        model_id: item.model_id || null,
        product_type_id: item.product_type_id || null,
        category_id: item.category_id || null,
        cost_price: Number(item.cost_price) || 0,
        sell_price: Number(item.sell_price) || 0,
        stock: 0,
        description: item.description || "",
        family_id: item.family_id || null,
        is_active: true,
      };
    });

    const { data: insertedProducts, error: productsError } = await supabase
      .from("products")
      .insert(productsToInsert)
      .select();

    if (productsError) throw productsError;

    const { data: typeData } = await supabase
      .from("stock_movement_types")
      .select("id")
      .eq("movement_name", "Opening Stock")
      .single();

    const movementsToInsert = [];
    const attributeValuesToInsert = [];
    const productItemsToInsert = [];

    const allSlugs = [
      ...new Set(
        productsData.flatMap((p) => Object.keys(p.attributes || {})),
      ),
    ];
    const { data: attributesList } = await supabase
      .from("attributes")
      .select("id, slug")
      .in("slug", allSlugs);

    const attrMap =
      attributesList?.reduce(
        (acc, curr) => ({ ...acc, [curr.slug]: curr.id }),
        {},
      ) || {};

    insertedProducts.forEach((product, index) => {
      const originalData = productsData[index];
      if (!originalData) return;

      // Product units (IMEI / Serial)
      if (originalData.units && originalData.units.length > 0) {
        originalData.units.forEach((unit) => {
          productItemsToInsert.push({
            product_id: product.id,
            imei: unit.imei || null,
            serial_number: unit.serial_number || null,
            warehouse_id: originalData.warehouse_id,
            status: "available",
            purchase_price: product.cost_price,
            sell_price: product.sell_price,
          });
        });
      }

      // Stock movement
      const finalQty =
        originalData.units && originalData.units.length > 0
          ? originalData.units.length
          : Number(originalData.stock || 0);

      if (originalData.warehouse_id && finalQty > 0) {
        movementsToInsert.push({
          product_id: product.id,
          quantity: finalQty,
          warehouse_id: originalData.warehouse_id,
          movement_type_id: typeData?.id,
          reference_type: "Bulk Import",
          reference_id: product.id,
        });
      }

      // Attributes
      const attrs = originalData.attributes || {};
      for (let slug in attrs) {
        if (attrMap[slug]) {
          let rawVal = attrs[slug];
          let finalVal = typeof rawVal === "object"
            ? rawVal?.value || rawVal?.label || ""
            : String(rawVal ?? "");
          attributeValuesToInsert.push({
            product_id: product.id,
            attribute_id: attrMap[slug],
            value: finalVal.trim(),
          });
        }
      }
    });

    // Bulk inserts
    if (productItemsToInsert.length > 0) {
      const { error: itemsErr } = await supabase
        .from("product_units")
        .insert(productItemsToInsert);
      if (itemsErr) console.error("Error inserting units:", itemsErr.message);
    }

    if (movementsToInsert.length > 0) {
      const { error: movError } = await supabase
        .from("stock_movements")
        .insert(movementsToInsert);
      if (movError)
        console.error("Error inserting movements:", movError.message);
    }

    if (attributeValuesToInsert.length > 0) {
      const { error: attrInsertError } = await supabase
        .from("product_attribute_values")
        .insert(attributeValuesToInsert);
      if (attrInsertError) {
        console.error(
          "Error inserting attribute values:",
          attrInsertError.message,
        );
      }
    }

    return insertedProducts;
  } catch (err) {
    console.error("Error in Bulk Saving Process:", err);
    throw err;
  }
}
