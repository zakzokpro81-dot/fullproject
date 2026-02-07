import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Autocomplete, CircularProgress } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getProductTypes, getModels, getAttributes, saveProduct, getWarehouses, getProductAttributes } from "./product.api";
import { ModelAutocomplete } from "./ModelAutocomplete";

const ProductForm = ({ open, onClose, defaultValues }) => {
    const { control, handleSubmit, watch, reset, setValue } = useForm({ defaultValues: defaultValues || {} });
    const [formReady, setFormReady] = useState(false);
    const watchedCategory = watch("category");
    const watchedProductType = watch("productType");
    const isEditing = !!defaultValues;

    // جلب البيانات الأساسية
    const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
    const { data: warehouses } = useQuery({ queryKey: ["warehouses"], queryFn: getWarehouses });

    // نحدد IDs للـ Edit Mode أو للـ Watch
    const categoryId = watchedCategory?.id || defaultValues?.category?.id || null;
    const productTypeId = watchedProductType?.id || defaultValues?.productType?.id || null;

    // Product Types
    const { data: productTypes } = useQuery({ queryKey: ["productTypes", categoryId], queryFn: () => getProductTypes(categoryId), enabled: !!categoryId });

    // Models
    const { data: models } = useQuery({ queryKey: ["models", productTypeId], queryFn: () => getModels(productTypeId), enabled: !!productTypeId });

    // Attributes
    const { data: attributes } = useQuery({ queryKey: ["attributes", productTypeId], queryFn: () => getAttributes(productTypeId), enabled: !!productTypeId });

    // Product Attribute Values عند التحرير
    const { data: productAttributes } = useQuery({ queryKey: ["productAttributes", defaultValues?.id], queryFn: () => getProductAttributes(defaultValues.id), enabled: isEditing && !!defaultValues?.id });

    // نحدد هل كل البيانات جاهزة للعرض
    const loadingEditData = isEditing && (!categories || !productTypes || !models || !attributes || !productAttributes || !warehouses);

    // تعبئة الفورم عند إضافة جديد
    useEffect(() => {
        if (open && !isEditing && warehouses) {
            reset({ category: null, productType: null, model: null, attributes: {}, sellPrice: 0, costPrice: 0, stock: 0, description: "", warehouse: warehouses[0] || null });
            setFormReady(true);
        }
    }, [open, isEditing, reset, warehouses]);

    // تعبئة الفورم عند التحرير
    // useEffect(() => {
    //     if (open && isEditing && !loadingEditData) {
    //         // category
    //         setValue("category", categories.find(c => c.id === defaultValues.category?.id) || null);
    //         // productType
    //         setValue("productType", productTypes.find(pt => pt.id === defaultValues.productType?.id) || null);
    //         // model
    //         setValue("model", models.find(m => m.model_id === defaultValues.model?.model_id) || null);
    //         // attributes
    //         const attrValues = {};
    //         attributes.forEach(attr => {
    //             const prodAttr = productAttributes.find(pa => pa.attribute_slug === attr.slug);
    //             attrValues[attr.slug] = prodAttr?.value ?? (attr.has_options ? null : "");
    //         });
    //         setValue("attributes", attrValues);
    //         // قيم اخرى
    //         setValue("sellPrice", defaultValues.sellPrice || 0);
    //         setValue("costPrice", defaultValues.costPrice || 0);
    //         setValue("stock", defaultValues.stock || 0);
    //         setValue("description", defaultValues.description || "");
    //         setValue("warehouse", defaultValues.warehouse || warehouses[0] || null);
    //         setFormReady(true);
    //     }
    // }, [ open, isEditing, categories, productTypes, models, attributes, warehouses, productAttributes, defaultValues, setValue, loadingEditData ]);


// تعبئة الفورم عند التحرير
useEffect(() => {
    if (open && isEditing && warehouses) {
        // نضع القيم مباشرة من المنتج الممرر (دون البحث في القوائم المنسدلة)
        // هذا يضمن ظهور النص فوراً حتى لو لم تكتمل الـ Queries الأخرى
        setValue("category", defaultValues.category || null);
        setValue("productType", defaultValues.productType || null);
        setValue("model", defaultValues.model || null);

        // تعبئة السمات (Attributes)
        if (attributes && productAttributes) {
            const attrValues = {};
            attributes.forEach(attr => {
                const prodAttr = productAttributes.find(pa => pa.attribute_id === attr.id);
                if (prodAttr) {
                    attrValues[attr.slug] = prodAttr.value;
                }
            });
            setValue("attributes", attrValues);
        }

        // تعبئة باقي الحقول
        setValue("sellPrice", defaultValues.sellPrice || 0);
        setValue("costPrice", defaultValues.costPrice || 0);
        setValue("stock", defaultValues.stock || 0);
        setValue("description", defaultValues.description || "");
        setValue("warehouse", warehouses.find(w => w.id === defaultValues.warehouse_id) || warehouses[0]);
        
        setFormReady(true);
    }
}, [open, isEditing, attributes, productAttributes, warehouses, defaultValues, setValue]);


// تعديل: لا تقم بتصفير الحقول إذا كنا في وضع التحرير
useEffect(() => { 
    if (!isEditing) {
        setValue("productType", null); 
        setValue("model", null); 
    }
}, [watchedCategory, setValue, isEditing]);

useEffect(() => { 
    if (!isEditing) {
        setValue("model", null); 
    }
}, [watchedProductType, setValue, isEditing]);


    // إعادة البرودكت تايب والموديل عند تغيير الفئة
    useEffect(() => { setValue("productType", null); setValue("model", null); }, [watchedCategory, setValue]);
    // إعادة الموديل عند تغيير البرودكت تايب
    useEffect(() => { setValue("model", null); }, [watchedProductType, setValue]);

    async function onSubmit(formData) {
        try {
            const productData = {
                ...formData,
                name: formData.model?.label || "",
                brand_id: formData.model?.brand_id || null,
                model_id: formData.model?.model_id || null,
                family_id: formData.model?.family_id || null,
                product_type_id: formData.productType?.id || null,
                sell_price: formData.sellPrice || 0,
                cost_price: formData.costPrice || 0,
                stock: formData.stock || 0,
                warehouse_id: formData.warehouse?.id || null
            };
            await saveProduct(productData);
            onClose();
        } catch (err) {
            console.error("Failed to save product:", err);
            alert("Failed to save product");
        }
    }

    if (!formReady) {
        return <CircularProgress size={40} style={{ margin: "40px auto", display: "block" }} />;
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEditing ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogContent>
                {/* Category */}
                <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                        <Autocomplete
                            {...field}
                            value={field.value ?? null}
                            options={categories || []}
                            getOptionLabel={(option) => option?.name || ""}
                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                            onChange={(e, value) => field.onChange(value)}
                            renderInput={(params) => <TextField {...params} label="Category" margin="normal" />}
                        />
                    )}
                />
                {/* Product Type */}
                {(watchedCategory || isEditing) && (
                    <Controller
                        name="productType"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                {...field}
                                value={field.value ?? null}
                                options={productTypes || []}
                                getOptionLabel={(option) => option.name}
                                onChange={(e, value) => field.onChange(value)}
                                renderInput={(params) => <TextField {...params} label="Product Type" margin="normal" />}
                            />
                        )}
                    />
                )}
                {/* Model */}
                {(watchedProductType || isEditing) && (
                    <Controller
                        name="model"
                        control={control}
                        render={({ field }) => (
                            <ModelAutocomplete value={field.value} onChange={field.onChange} label="Model" />
                        )}
                    />
                )}
                {/* Attributes */}
                {(watchedProductType || isEditing) && attributes?.map(attr => (
                    <Controller
                        key={attr.id}
                        name={`attributes.${attr.slug}`}
                        control={control}
                        render={({ field }) => attr.has_options ? (
                            <Autocomplete
                                options={attr.options || []}
                                getOptionLabel={(option) => option.value}
                                value={field.value ?? null}
                                onChange={(e, value) => field.onChange(value)}
                                renderInput={(params) => <TextField {...params} label={attr.name} margin="normal" fullWidth />}
                            />
                        ) : (
                            <TextField {...field} label={attr.name} margin="normal" fullWidth value={field.value || ""} onChange={field.onChange} />
                        )}
                    />
                ))}
                {/* Prices, Stock, Warehouse, Description */}
                <Controller name="sellPrice" control={control} render={({ field }) => <TextField {...field} label="Sell Price" type="number" margin="normal" fullWidth />} />
                <Controller name="costPrice" control={control} render={({ field }) => <TextField {...field} label="Cost Price" type="number" margin="normal" fullWidth />} />
                <Controller name="stock" control={control} render={({ field }) => <TextField {...field} label="Stock" type="number" margin="normal" fullWidth />} />
                {warehouses?.length > 0 && (
                    <Controller
                        name="warehouse"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                {...field}
                                value={field.value ?? null}
                                options={warehouses || []}
                                getOptionLabel={(option) => option.name}
                                onChange={(e, value) => field.onChange(value)}
                                renderInput={(params) => <TextField {...params} label="Warehouse" margin="normal" />}
                            />
                        )}
                    />
                )}
                <Controller name="description" control={control} render={({ field }) => <TextField {...field} label="Description" multiline rows={3} margin="normal" fullWidth />} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit(onSubmit)}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductForm;
