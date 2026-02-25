import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSalesReturns,
  createSalesReturn,
  updateSalesReturn,
  deleteSalesReturn,
  deleteSalesReturns,
  SALES_RETURN_QUERY_KEY,
} from "./salesReturn.api";
import supabase from "../../config/supabase";

export function useSalesReturnQuery() {
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
    queryKey: [SALES_RETURN_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () =>
      getSalesReturns({
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

export function useSalesReturnMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [SALES_RETURN_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createSalesReturn,
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Sales return created successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to create sales return", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSalesReturn(id, data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Sales return updated successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to update sales return", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSalesReturn,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Sales return deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to delete sales return", "error");
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: deleteSalesReturns,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Sales returns deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to delete sales returns", "error");
    },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}

export function useSalesReturnFormOptions() {
  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices_for_return_select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, customers(id, name)")
        .order("id", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: returnStatuses = [] } = useQuery({
    queryKey: ["return_statuses", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("return_statuses")
        .select("id, status_name");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  return { invoices, returnStatuses };
}

export function useInvoiceItems(invoiceId) {
  const { data: invoiceItems = [] } = useQuery({
    queryKey: ["invoice_items_for_return", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return [];
      const { data, error } = await supabase
        .from("invoice_items")
        .select("id, quantity, unit_price, total_price, product_variant_id")
        .eq("invoice_id", invoiceId);
      if (error) throw error;
      return data;
    },
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 5,
  });

  return invoiceItems;
}
