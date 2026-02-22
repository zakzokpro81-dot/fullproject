// family.hooks.js
// Custom hooks: useFamilyQuery, useFamilyMutations, useFamilyFormOptions

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFamilies,
  createFamily,
  updateFamily,
  deleteFamily,
  deleteFamilies,
  FAMILY_QUERY_KEY,
} from "./family.api";
import supabase from "../../config/supabase";

// ────────────────────────────────────────────────────────────
// useFamilyQuery — server-side pagination + debounced search
// ────────────────────────────────────────────────────────────
export function useFamilyQuery() {
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
    queryKey: [FAMILY_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () =>
      getFamilies({
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

// ────────────────────────────────────────────────────────────
// useFamilyMutations — create / update / delete + notifications
// ────────────────────────────────────────────────────────────
export function useFamilyMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [FAMILY_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createFamily,
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Family created successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to create family", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateFamily(id, data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Family updated successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to update family", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFamily,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Family deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to delete family", "error");
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: deleteFamilies,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Selected families deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to delete families", "error");
    },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}

// ────────────────────────────────────────────────────────────
// useFamilyFormOptions — reference data for FK select fields
// ────────────────────────────────────────────────────────────
export function useFamilyFormOptions() {
  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error } = await supabase.from("brands").select("id, name");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: productTypes = [] } = useQuery({
    queryKey: ["product_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_types")
        .select("id, name");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  return { brands, productTypes };
}
