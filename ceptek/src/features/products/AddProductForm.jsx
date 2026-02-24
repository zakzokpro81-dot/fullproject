import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addProductSchema } from "./product.schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  getProductTypes,
  getModels,
  getAttributes,
  createProductWithStock,
  saveProduct,
  getWarehouses,
} from "./product.api";
import { ModelAutocomplete } from "./ModelAutocomplete";

const AddProductForm = ({ open, onClose, showSnackbar }) => {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addProductSchema),
    defaultValues: {},
  });
  const [formReady, setFormReady] = useState(false);
  const watchedCategory = watch("category");
  const watchedProductType = watch("productType");

  // Fetch form data
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: open,
  });
  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: getWarehouses,
    enabled: open,
  });
  const categoryId = watchedCategory?.id || null;
  const productTypeId = watchedProductType?.id || null;

  const { data: productTypes } = useQuery({
    queryKey: ["productTypes", categoryId],
    queryFn: () => getProductTypes(categoryId),
    enabled: !!categoryId,
  });
  const { data: attributes } = useQuery({
    queryKey: ["attributes", productTypeId],
    queryFn: () => getAttributes(productTypeId),
    enabled: !!productTypeId,
  });

  // Mutation
  const mutation = useMutation({
    mutationFn: saveProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      onClose();
      reset();
    },
    onError: () => showSnackbar?.("Failed to save product", "error"),
  });

  useEffect(() => {
    if (open && warehouses) {
      reset({
        category: null,
        productType: null,
        model: null,
        attributes: {},
        sellPrice: 0,
        costPrice: 0,
        stock: 0,
        description: "",
        warehouse: warehouses[0] || null,
      });
      setFormReady(true);
    }
  }, [open, reset, warehouses]);

  useEffect(() => {
    setValue("productType", null);
    setValue("model", null);
  }, [watchedCategory, setValue]);
  useEffect(() => {
    setValue("model", null);
  }, [watchedProductType, setValue]);

  const onSubmit = (formData) => {
    const productData = {
      ...formData,
      name: formData.model?.label || "",
      brand_id: formData.model?.brand_id || null,
      model_id: formData.model?.model_id || null,
      family_id: formData.model?.family_id || null,
      product_type_id: formData.productType?.id || null,
      category_id: formData.category?.id || null,
      sell_price: formData.sellPrice || 0,
      cost_price: formData.costPrice || 0,
      stock: formData.stock || 0,
      warehouse_id: formData.warehouse?.id || null,
    };
    mutation.mutate(productData);
  };

  if (!formReady)
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogContent
          sx={{ display: "flex", justifyContent: "center", py: 6 }}
        >
          <CircularProgress size={40} />
        </DialogContent>
      </Dialog>
    );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Product</DialogTitle>
      <DialogContent>
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
              renderInput={(params) => (
                <TextField {...params} label="Category" margin="normal" />
              )}
            />
          )}
        />

        {watchedCategory && (
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
                renderInput={(params) => (
                  <TextField {...params} label="Product Type" margin="normal" />
                )}
              />
            )}
          />
        )}

        {watchedProductType && (
          <Controller
            name="model"
            control={control}
            render={({ field }) => (
              <ModelAutocomplete
                value={field.value}
                onChange={field.onChange}
                label="Model"
                selectedCategory={watchedCategory}
                selectedProductType={watchedProductType}
              />
            )}
          />
        )}

        {watchedProductType &&
          attributes?.map((attr) => (
            <Controller
              key={attr.id}
              name={`attributes.${attr.slug}`}
              control={control}
              render={({ field }) =>
                attr.has_options ? (
                  <Autocomplete
                    options={attr.options || []}
                    getOptionLabel={(option) => option.value}
                    value={field.value ?? null}
                    onChange={(e, value) => field.onChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={attr.name}
                        margin="normal"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <TextField
                    {...field}
                    label={attr.name}
                    margin="normal"
                    fullWidth
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                )
              }
            />
          ))}

        <Controller
          name="sellPrice"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Sell Price"
              type="number"
              margin="normal"
              fullWidth
            />
          )}
        />
        <Controller
          name="costPrice"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Cost Price"
              type="number"
              margin="normal"
              fullWidth
            />
          )}
        />
        <Controller
          name="stock"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Stock"
              type="number"
              margin="normal"
              fullWidth
            />
          )}
        />

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
                renderInput={(params) => (
                  <TextField {...params} label="Warehouse" margin="normal" />
                )}
              />
            )}
          />
        )}

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Description"
              multiline
              rows={3}
              margin="normal"
              fullWidth
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductForm;
