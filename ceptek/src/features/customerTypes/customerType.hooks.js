import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomerTypes,
  createCustomerType,
  updateCustomerType,
  deleteCustomerType,
  deleteCustomerTypes,
  CUSTOMER_TYPE_QUERY_KEY,
} from "./customerType.api";

export function useCustomerTypeQuery() {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
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
    queryKey: [CUSTOMER_TYPE_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () =>
      getCustomerTypes({
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

export function useCustomerTypeMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [CUSTOMER_TYPE_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createCustomerType,
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Created successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || "Failed to create", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCustomerType(id, data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Updated successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || "Failed to update", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomerType,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || "Failed to delete", "error");
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: deleteCustomerTypes,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || "Failed to delete", "error");
    },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}
