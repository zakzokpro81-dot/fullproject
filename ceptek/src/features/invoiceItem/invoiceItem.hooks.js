import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomersForSelect,
  getInvoiceStatuses,
  getProductVariants,
  saveCompleteInvoice,
  INVOICE_ITEM_QUERY_KEY,
} from "./invoiceItem.api";

export function useInvoiceItemFormOptions() {
  const { data: customers } = useQuery({
    queryKey: ["customersForInvoice"],
    queryFn: getCustomersForSelect,
  });

  const { data: statuses } = useQuery({
    queryKey: ["invoiceStatuses"],
    queryFn: getInvoiceStatuses,
  });

  const { data: variants } = useQuery({
    queryKey: ["productVariants"],
    queryFn: getProductVariants,
  });

  return {
    customers: customers || [],
    statuses: statuses || [],
    variants: variants || [],
  };
}

export function useInvoiceItemMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ invoice, items }) => saveCompleteInvoice(invoice, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: [INVOICE_ITEM_QUERY_KEY] });
      onSuccess?.();
      showMessageDialog?.("Invoice created successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || "Failed to create invoice", "error");
    },
  });

  return { createMutation };
}
