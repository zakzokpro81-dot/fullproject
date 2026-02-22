import { useState, useEffect, useRef } from "react";
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

  const rowCountRef = useRef(0);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [BRAND_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () =>
      getBrands({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText: debouncedSearch,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (prev) => prev,
  });

  // Keep the last known rowCount so the DataGrid never resets to 0
  // mid-flight (which causes MUI to override paginationModel.pageSize).
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
 * Returns create / update / delete mutations with cache invalidation
 * and notification callbacks.
 *
 * @param {object} options
 * @param {function} options.onSuccess   - called after any successful mutation (e.g., close dialog)
 * @param {function} options.showSnackbar - (message, severity) => void
 */
export function useBrandMutations({ onSuccess, showSnackbar }) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [BRAND_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      invalidate();
      showSnackbar("Brand created successfully", "success");
      onSuccess();
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to create brand", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateBrand(id, data),
    onSuccess: () => {
      invalidate();
      showSnackbar("Brand updated successfully", "success");
      onSuccess();
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to update brand", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      invalidate();
      showSnackbar("Brand deleted successfully", "success");
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to delete brand", "error");
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: deleteBrands,
    onSuccess: () => {
      invalidate();
      showSnackbar("Brands deleted successfully", "success");
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to delete brands", "error");
    },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}
