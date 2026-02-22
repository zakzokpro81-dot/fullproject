// model.hooks.js
// Custom hooks: useModelQuery + useModelMutations
// ❌ لا MUI — منطق فقط

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getModels,
  createModel,
  updateModel,
  deleteModel,
  deleteModels,
  getAllBrands,
  getAllFamilies,
  MODEL_QUERY_KEY,
} from "./model.api";

// ==========================================
// useModelQuery — paginated list + search
// Also exposes brands/families for the form
// ==========================================
export function useModelQuery() {
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

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: [MODEL_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () =>
      getModels({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText: debouncedSearch,
      }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  // Lookup data for the form dropdowns
  const { data: brands = [] } = useQuery({
    queryKey: ["brands-all"],
    queryFn: getAllBrands,
    staleTime: 1000 * 60 * 10,
  });

  const { data: families = [] } = useQuery({
    queryKey: ["families-all"],
    queryFn: getAllFamilies,
    staleTime: 1000 * 60 * 10,
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
    brands,
    families,
  };
}

// ==========================================
// useModelMutations — create / update / delete
// ==========================================
export function useModelMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [MODEL_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createModel,
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Model created successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to create model", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateModel(id, data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Model updated successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to update model", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteModel,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Model deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to delete model", "error");
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: deleteModels,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Selected models deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to delete models", "error");
    },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}
