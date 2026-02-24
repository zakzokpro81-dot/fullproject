import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInvoices,
  getDailySummary,
  getInvoiceFormData,
  getProductsForInvoice,
  createInvoiceAction,
  INVOICE_QUERY_KEY,
} from "./invoice.api";

export function useInvoiceQuery() {
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [INVOICE_QUERY_KEY],
    queryFn: getInvoices,
    staleTime: 1000 * 60 * 5,
  });

  return {
    rows: data || [],
    isLoading,
    isFetching,
    isError,
    error,
  };
}

export function useDailySummaryQuery() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [INVOICE_QUERY_KEY, "dailySummary"],
    queryFn: getDailySummary,
    staleTime: 1000 * 60 * 5,
  });

  return {
    summary: data || null,
    isLoading,
    isError,
    error,
  };
}

export function useInvoiceFormOptions(warehouseId) {
  const { data: formData } = useQuery({
    queryKey: ["invoiceFormData"],
    queryFn: getInvoiceFormData,
  });

  const { data: products } = useQuery({
    queryKey: ["productsForInvoice", warehouseId],
    queryFn: () => getProductsForInvoice(warehouseId),
    enabled: !!warehouseId,
  });

  return {
    customers: formData?.customers || [],
    warehouses: formData?.warehouses || [],
    accounts: formData?.accounts || [],
    products: products || [],
  };
}

export function useInvoiceMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createInvoiceAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVOICE_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.();
      showMessageDialog?.("Sale completed successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || "Sale process failed", "error");
    },
  });

  return { createMutation };
}
