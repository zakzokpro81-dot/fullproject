import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPurchaseInvoices, createPurchaseInvoice, updatePurchaseInvoice, deletePurchaseInvoice, deletePurchaseInvoices,
  getPurchaseInvoiceItems, getProductsForPurchase, PURCHASE_INVOICE_QUERY_KEY,
} from "./purchaseInvoice.api";
import supabase from "../../config/supabase";

export function usePurchaseInvoiceQuery() {
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
    queryKey: [PURCHASE_INVOICE_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () => getPurchaseInvoices({ page: paginationModel.page, pageSize: paginationModel.pageSize, searchText: debouncedSearch }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return { rows: data?.data || [], rowCount: data?.count || 0, isLoading, isFetching, isError, error, paginationModel, setPaginationModel, searchText, setSearchText };
}

export function usePurchaseInvoiceMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [PURCHASE_INVOICE_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createPurchaseInvoice,
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Purchase invoice created successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to create purchase invoice", "error"); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updatePurchaseInvoice(id, data),
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Purchase invoice updated successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to update purchase invoice", "error"); },
  });
  const deleteMutation = useMutation({
    mutationFn: deletePurchaseInvoice,
    onSuccess: () => { invalidate(); showMessageDialog?.("Purchase invoice deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete purchase invoice", "error"); },
  });
  const deleteMultipleMutation = useMutation({
    mutationFn: deletePurchaseInvoices,
    onSuccess: () => { invalidate(); showMessageDialog?.("Purchase invoices deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete purchase invoices", "error"); },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}

export function usePurchaseInvoiceFormOptions() {
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("id, name").eq("is_active", true);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ["purchase_orders", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("purchase_orders").select("id");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: invoiceStatuses = [] } = useQuery({
    queryKey: ["invoice_statuses", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoice_statuses").select("id, status_name");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  return { suppliers, purchaseOrders, invoiceStatuses };
}

export function useProductsForPurchase() {
  const { data: products = [] } = useQuery({
    queryKey: ["products_for_purchase"],
    queryFn: getProductsForPurchase,
    staleTime: 1000 * 60 * 10,
  });
  return products;
}

export function usePurchaseInvoiceItems(invoiceId) {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["purchase_invoice_items", invoiceId],
    queryFn: () => getPurchaseInvoiceItems(invoiceId),
    enabled: !!invoiceId,
  });
  return { items, isLoading };
}
