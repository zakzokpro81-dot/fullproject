import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

/**
 * Factory hook that generates standard create / update / delete / deleteMultiple
 * mutations for any feature module.
 *
 * @param {object}   opts
 * @param {string}   opts.queryKey         - React-Query key to invalidate
 * @param {Function} opts.createFn         - API create function
 * @param {Function} opts.updateFn         - API update function (id, data)
 * @param {Function} opts.deleteFn         - API single-delete function (id)
 * @param {Function} opts.deleteMultipleFn - API bulk-delete function (ids[])
 * @param {Function} [opts.onSuccess]      - Called after any successful mutation
 * @param {Function} [opts.showMessageDialog] - Notification callback (msg, level)
 * @param {string}   [opts.entityName]     - Translated entity name for messages
 */
export default function useCrudMutations({
  queryKey,
  createFn,
  updateFn,
  deleteFn,
  deleteMultipleFn,
  onSuccess,
  showMessageDialog,
  entityName,
}) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const name = entityName || "Item";

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [queryKey] });

  const createMutation = useMutation({
    mutationFn: createFn,
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.(t("common.createdSuccess", { item: name }), "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || t("common.createFailed", { item: name }), "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateFn(id, data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.(t("common.updatedSuccess", { item: name }), "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || t("common.updateFailed", { item: name }), "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.(t("common.deletedSuccess", { item: name }), "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || t("common.deleteFailed", { item: name }), "error");
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: deleteMultipleFn,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.(t("common.deletedMultipleSuccess", { item: name }), "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || t("common.deleteMultipleFailed", { item: name }), "error");
    },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}
