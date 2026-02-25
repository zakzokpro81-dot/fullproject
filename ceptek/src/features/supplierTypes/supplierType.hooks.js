import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSupplierTypes, createSupplierType, updateSupplierType, deleteSupplierType, deleteSupplierTypes, SUPPLIER_TYPE_QUERY_KEY,
} from "./supplierType.api";

export function useSupplierTypeQuery() {
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
    queryKey: [SUPPLIER_TYPE_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () => getSupplierTypes({ page: paginationModel.page, pageSize: paginationModel.pageSize, searchText: debouncedSearch }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return { rows: data?.data || [], rowCount: data?.count || 0, isLoading, isFetching, isError, error, paginationModel, setPaginationModel, searchText, setSearchText };
}

export function useSupplierTypeMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [SUPPLIER_TYPE_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createSupplierType,
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Supplier type created successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to create supplier type", "error"); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSupplierType(id, data),
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Supplier type updated successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to update supplier type", "error"); },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSupplierType,
    onSuccess: () => { invalidate(); showMessageDialog?.("Supplier type deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete supplier type", "error"); },
  });
  const deleteMultipleMutation = useMutation({
    mutationFn: deleteSupplierTypes,
    onSuccess: () => { invalidate(); showMessageDialog?.("Supplier types deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete supplier types", "error"); },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}
