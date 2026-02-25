import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, deletePurchaseOrders, PURCHASE_ORDER_QUERY_KEY,
} from "./purchaseOrder.api";
import supabase from "../../config/supabase";

export function usePurchaseOrderQuery() {
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
    queryKey: [PURCHASE_ORDER_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () => getPurchaseOrders({ page: paginationModel.page, pageSize: paginationModel.pageSize, searchText: debouncedSearch }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return { rows: data?.data || [], rowCount: data?.count || 0, isLoading, isFetching, isError, error, paginationModel, setPaginationModel, searchText, setSearchText };
}

export function usePurchaseOrderMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDER_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Purchase order created successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to create purchase order", "error"); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updatePurchaseOrder(id, data),
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Purchase order updated successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to update purchase order", "error"); },
  });
  const deleteMutation = useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => { invalidate(); showMessageDialog?.("Purchase order deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete purchase order", "error"); },
  });
  const deleteMultipleMutation = useMutation({
    mutationFn: deletePurchaseOrders,
    onSuccess: () => { invalidate(); showMessageDialog?.("Purchase orders deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete purchase orders", "error"); },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}

export function usePurchaseOrderFormOptions() {
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("id, name").eq("is_active", true);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("warehouses").select("id, name");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: orderStatuses = [] } = useQuery({
    queryKey: ["order_statuses", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("order_statuses").select("id, status_name");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  return { suppliers, warehouses, orderStatuses };
}
