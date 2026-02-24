import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  deleteBrands,
  BRAND_QUERY_KEY,
} from "./brand.api";

/**
 * Fetches the brand list with server-side pagination and debounced search.
 */
export function useBrandQuery() {
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

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [BRAND_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () =>
      getBrands({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText: debouncedSearch,
      }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
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
  };
}

/**
 * Returns create / update / delete mutations with cache invalidation
 * and notification callbacks.
 */
export function useBrandMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [BRAND_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Brand created successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to create brand", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateBrand(id, data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Brand updated successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to update brand", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Brand deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to delete brand", "error");
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: deleteBrands,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Brands deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to delete brands", "error");
    },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}
