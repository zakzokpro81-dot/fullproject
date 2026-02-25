import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSupplierPayments, createSupplierPayment, updateSupplierPayment, deleteSupplierPayment, deleteSupplierPayments, SUPPLIER_PAYMENT_QUERY_KEY,
} from "./supplierPayment.api";
import supabase from "../../config/supabase";

export function useSupplierPaymentQuery() {
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
    queryKey: [SUPPLIER_PAYMENT_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () => getSupplierPayments({ page: paginationModel.page, pageSize: paginationModel.pageSize, searchText: debouncedSearch }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return { rows: data?.data || [], rowCount: data?.count || 0, isLoading, isFetching, isError, error, paginationModel, setPaginationModel, searchText, setSearchText };
}

export function useSupplierPaymentMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [SUPPLIER_PAYMENT_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createSupplierPayment,
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Supplier payment created successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to create supplier payment", "error"); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSupplierPayment(id, data),
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Supplier payment updated successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to update supplier payment", "error"); },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSupplierPayment,
    onSuccess: () => { invalidate(); showMessageDialog?.("Supplier payment deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete supplier payment", "error"); },
  });
  const deleteMultipleMutation = useMutation({
    mutationFn: deleteSupplierPayments,
    onSuccess: () => { invalidate(); showMessageDialog?.("Supplier payments deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete supplier payments", "error"); },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}

export function useSupplierPaymentFormOptions() {
  const { data: purchaseInvoices = [] } = useQuery({
    queryKey: ["purchase_invoices", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("purchase_invoices").select("id, invoice_number");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("accounts").select("id, name");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  return { purchaseInvoices, accounts };
}
