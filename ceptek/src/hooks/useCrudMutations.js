import { useMutation, useQueryClient } from "@tanstack/react-query";

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
 */
export default function useCrudMutations({
  queryKey,
  createFn,
  updateFn,
  deleteFn,
  deleteMultipleFn,
  onSuccess,
  showMessageDialog,
}) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [queryKey] });

  const createMutation = useMutation({
    mutationFn: createFn,
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
    mutationFn: ({ id, data }) => updateFn(id, data),
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
    mutationFn: deleteFn,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || "Failed to delete", "error");
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: deleteMultipleFn,
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
