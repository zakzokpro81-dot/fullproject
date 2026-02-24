import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrders,
  createOrderAction,
  confirmAndShipOrder,
  getOrderFormData,
  getProductsForOrder,
  ORDER_QUERY_KEY,
} from "./order.api";

export function useOrderQuery() {
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [ORDER_QUERY_KEY],
    queryFn: getOrders,
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

export function useOrderFormOptions(warehouseId) {
  const { data: formData } = useQuery({
    queryKey: ["orderFormData"],
    queryFn: getOrderFormData,
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["productsForOrder", warehouseId],
    queryFn: () => getProductsForOrder(warehouseId),
    enabled: !!warehouseId,
  });

  return {
    customers: formData?.customers || [],
    warehouses: formData?.warehouses || [],
    products: products || [],
    loadingProducts,
  };
}

export function useOrderMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createOrderAction,
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Order created successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || "Failed to create order", "error");
    },
  });

  const confirmMutation = useMutation({
    mutationFn: ({ orderId, warehouseId, items }) =>
      confirmAndShipOrder(orderId, warehouseId, items),
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Order shipped successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || "Shipping failed", "error");
    },
  });

  return { createMutation, confirmMutation };
}
