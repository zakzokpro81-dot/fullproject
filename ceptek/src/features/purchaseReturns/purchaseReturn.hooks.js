import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPurchaseReturns, createPurchaseReturn, updatePurchaseReturn, deletePurchaseReturn, deletePurchaseReturns, PURCHASE_RETURN_QUERY_KEY,
} from "./purchaseReturn.api";
import supabase from "../../config/supabase";

export function usePurchaseReturnQuery() {
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
    queryKey: [PURCHASE_RETURN_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () => getPurchaseReturns({ page: paginationModel.page, pageSize: paginationModel.pageSize, searchText: debouncedSearch }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return { rows: data?.data || [], rowCount: data?.count || 0, isLoading, isFetching, isError, error, paginationModel, setPaginationModel, searchText, setSearchText };
}

export function usePurchaseReturnMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [PURCHASE_RETURN_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createPurchaseReturn,
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Purchase return created successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to create purchase return", "error"); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updatePurchaseReturn(id, data),
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Purchase return updated successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to update purchase return", "error"); },
  });
  const deleteMutation = useMutation({
    mutationFn: deletePurchaseReturn,
    onSuccess: () => { invalidate(); showMessageDialog?.("Purchase return deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete purchase return", "error"); },
  });
  const deleteMultipleMutation = useMutation({
    mutationFn: deletePurchaseReturns,
    onSuccess: () => { invalidate(); showMessageDialog?.("Purchase returns deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete purchase returns", "error"); },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}

export function usePurchaseReturnFormOptions() {
  const { data: purchaseInvoiceItems = [] } = useQuery({
    queryKey: ["purchase_invoice_items", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_invoice_items")
        .select("id, purchase_invoice_id, product_id, quantity, unit_price");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: returnStatuses = [] } = useQuery({
    queryKey: ["return_statuses", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("return_statuses").select("id, status_name");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  return { purchaseInvoiceItems, returnStatuses };
}
