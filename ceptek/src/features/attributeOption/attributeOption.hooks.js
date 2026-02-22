import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAttributeOptions,
    createAttributeOption,
    updateAttributeOption,
    deleteAttributeOption,
    deleteAttributeOptions,
    getAttributes,
    ATTRIBUTE_OPTION_QUERY_KEY,
} from "./attributeOption.api";

/**
 * Fetches the attribute option list with server-side pagination and debounced search.
 */
export function useAttributeOptionQuery() {
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const [searchText, setSearchText] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [attributeId, setAttributeId] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchText);
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText]);

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
    } = useQuery({
        queryKey: [ATTRIBUTE_OPTION_QUERY_KEY, paginationModel, debouncedSearch, attributeId],
        queryFn: () =>
            getAttributeOptions({
                page: paginationModel.page,
                pageSize: paginationModel.pageSize,
                searchText: debouncedSearch,
                attributeId,
            }),
        staleTime: 1000 * 60 * 5,
        placeholderData: (prev) => prev,
    });

    return {
        rows: data?.data || [],
        rowCount: data?.count || 0,
        isLoading,
        isFetching,
        isError,
        error,
        paginationModel,
        setPaginationModel,
        searchText,
        setSearchText,
        attributeId,
        setAttributeId,
    };
}

/**
 * Fetches the list of attributes for the form dropdown.
 */
export function useAttributesQuery() {
    return useQuery({
        queryKey: ["attributes_for_options"],
        queryFn: getAttributes,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

/**
 * Returns create / update / delete mutations with cache invalidation
 * and notification callbacks.
 */
export function useAttributeOptionMutations({ onSuccess, showMessageDialog }) {
    const queryClient = useQueryClient();

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: [ATTRIBUTE_OPTION_QUERY_KEY] });

    const createMutation = useMutation({
        mutationFn: createAttributeOption,
        onSuccess: () => {
            invalidate();
            onSuccess?.();
            showMessageDialog?.("Created successfully", "success");
        },
        onError: (err) => {
            showMessageDialog?.(err.message || "Failed to create", "error");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateAttributeOption(id, data),
        onSuccess: () => {
            invalidate();
            onSuccess?.();
            showMessageDialog?.("Updated successfully", "success");
        },
        onError: (err) => {
            showMessageDialog?.(err.message || "Failed to update", "error");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAttributeOption,
        onSuccess: () => {
            invalidate();
            showMessageDialog?.("Deleted successfully", "success");
        },
        onError: (err) => {
            showMessageDialog?.(err.message || "Failed to delete", "error");
        },
    });

    const deleteMultipleMutation = useMutation({
        mutationFn: deleteAttributeOptions,
        onSuccess: () => {
            invalidate();
            showMessageDialog?.("Deleted successfully", "success");
        },
        onError: (err) => {
            showMessageDialog?.(err.message || "Failed to delete", "error");
        },
    });

    return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}
