import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductTypes,
  createProductType,
  updateProductType,
  deleteProductType,
  deleteProductTypes,
  PRODUCTTYPE_QUERY_KEY,
} from "./productType.api";

/**
 * Fetches the entity list with server-side pagination and debounced search.
 * Returns rows, total count, pagination controls, and search state.
 */
export function useProductTypeQuery() {
  // Pagination state
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // Search state with debounce
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Filter state
  const [filters, setFilters] = useState({
    tracking_type_id: "",
    variant_strategy_id: "",
    category_id: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      // Reset to first page when search or filters change
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, filters]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: [PRODUCTTYPE_QUERY_KEY, paginationModel, debouncedSearch, filters],
    queryFn: () =>
      getProductTypes({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText: debouncedSearch,
        filters,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (prev) => prev, // keep previous data while fetching next page
  });

  return {
    rows: data?.data || [],
    rowCount: data?.count || 0,
    isLoading,
    isFetching,
    isError,
    error,
    paginationModel,
    setPaginationModel,
    searchText,
    setSearchText,
    filters,
    setFilters,
  };
}

/**
 * Returns create / update / delete mutations with cache invalidation
 * and notification callbacks.
 */
export function useProductTypeMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [PRODUCTTYPE_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createProductType,
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Created successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to create", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProductType(id, data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Updated successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to update", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductType,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to delete", "error");
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: deleteProductTypes,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to delete", "error");
    },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}
