import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductTypeAttributes,
  getProductTypes,
  getAttributes,
  createProductTypeAttribute,
  updateProductTypeAttribute,
  deleteProductTypeAttribute,
  deleteProductTypeAttributes,
  PTA_QUERY_KEY,
} from "./productTypeAttributes.api";

export function usePTAQuery() {
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [PTA_QUERY_KEY],
    queryFn: getProductTypeAttributes,
  });

  return {
    rows: data || [],
    isLoading,
    isFetching,
    isError,
    error,
  };
}

export function usePTAFormOptions() {
  const { data: productTypes = [], isLoading: loadingProductTypes } = useQuery({
    queryKey: ["product_types"],
    queryFn: getProductTypes,
  });
  const { data: attributes = [], isLoading: loadingAttributes } = useQuery({
    queryKey: ["attributes"],
    queryFn: getAttributes,
  });
  return { productTypes, attributes, loadingProductTypes, loadingAttributes };
}

export function usePTAMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [PTA_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createProductTypeAttribute,
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
    mutationFn: ({ id, data }) => updateProductTypeAttribute(id, data),
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
    mutationFn: deleteProductTypeAttribute,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || "Failed to delete", "error");
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: deleteProductTypeAttributes,
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
