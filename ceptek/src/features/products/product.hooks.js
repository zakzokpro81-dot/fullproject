import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getWarehouses,
  getProductTypes,
  PRODUCT_QUERY_KEY,
} from "./product.queries";
import {
  deleteProduct,
  deleteProducts,
  softDeleteProduct,
  deactivateProduct,
  deactivateMultipleProducts,
} from "./product.mutations";

/**
 * Fetches the product list with server-side pagination, debounced search,
 * and optional warehouse/type filters.
 */
export function useProductQuery({ warehouseId, typeId } = {}) {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const rowCountRef = useRef(0);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [PRODUCT_QUERY_KEY, paginationModel, debouncedSearch, warehouseId, typeId],
    queryFn: () =>
      getProducts({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText: debouncedSearch,
        warehouseId,
        typeId,
      }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  if (data?.count !== undefined) {
    rowCountRef.current = data.count;
  }

  return {
    rows: data?.data || [],
    rowCount: rowCountRef.current,
    isLoading,
    isFetching,
    isError,
    error,
    paginationModel,
    setPaginationModel,
    searchText,
    setSearchText,
  };
}

/**
 * Fetches warehouse and product type reference data for filter dropdowns.
 */
export function useProductReferenceData() {
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: getWarehouses,
    staleTime: 1000 * 60 * 10,
  });

  const { data: productTypes = [] } = useQuery({
    queryKey: ["productTypes"],
    queryFn: getProductTypes,
    staleTime: 1000 * 60 * 10,
  });

  return { warehouses, productTypes };
}

/**
 * Returns deactivate / delete mutations with cache invalidation.
 */
export function useProductMutations({ onSuccess, showSnackbar }) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEY] });

  const deactivateSingleMutation = useMutation({
    mutationFn: deactivateProduct,
    onSuccess: () => {
      invalidate();
      showSnackbar("Product deactivated successfully", "success");
      onSuccess?.();
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to deactivate product", "error");
    },
  });

  const deactivateBulkMutation = useMutation({
    mutationFn: deactivateMultipleProducts,
    onSuccess: () => {
      invalidate();
      showSnackbar("Products deactivated successfully", "success");
      onSuccess?.();
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to deactivate products", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      invalidate();
      showSnackbar("Product deleted successfully", "success");
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to delete product", "error");
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: deleteProducts,
    onSuccess: () => {
      invalidate();
      showSnackbar("Products deleted successfully", "success");
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to delete products", "error");
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: softDeleteProduct,
    onSuccess: () => {
      invalidate();
      showSnackbar("Product archived successfully", "success");
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to archive product", "error");
    },
  });

  return {
    deactivateSingleMutation,
    deactivateBulkMutation,
    deleteMutation,
    deleteMultipleMutation,
    softDeleteMutation,
  };
}
