import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSuppliers, createSupplier, updateSupplier, deleteSupplier, deleteSuppliers, SUPPLIER_QUERY_KEY,
} from "./supplier.api";
import supabase from "../../config/supabase";

export function useSupplierQuery() {
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
    queryKey: [SUPPLIER_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () => getSuppliers({ page: paginationModel.page, pageSize: paginationModel.pageSize, searchText: debouncedSearch }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return { rows: data?.data || [], rowCount: data?.count || 0, isLoading, isFetching, isError, error, paginationModel, setPaginationModel, searchText, setSearchText };
}

export function useSupplierMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Supplier created successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to create supplier", "error"); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSupplier(id, data),
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Supplier updated successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to update supplier", "error"); },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => { invalidate(); showMessageDialog?.("Supplier deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete supplier", "error"); },
  });
  const deleteMultipleMutation = useMutation({
    mutationFn: deleteSuppliers,
    onSuccess: () => { invalidate(); showMessageDialog?.("Suppliers deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete suppliers", "error"); },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}

export function useSupplierFormOptions() {
  const { data: supplierTypes = [] } = useQuery({
    queryKey: ["supplier_types", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("supplier_types").select("id, type_name");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  return { supplierTypes };
}
