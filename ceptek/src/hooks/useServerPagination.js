import { useState, useEffect } from "react";

/**
 * Reusable hook for server-side pagination + debounced search state.
 *
 * @param {object}  [options]
 * @param {number}  [options.defaultPageSize=10]
 * @param {number}  [options.debounceMs=500]
 * @returns {{ paginationModel, setPaginationModel, searchText, setSearchText, debouncedSearch }}
 */
export default function useServerPagination({
  defaultPageSize = 10,
  debounceMs = 500,
} = {}) {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: defaultPageSize,
  });
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchText, debounceMs]);

  return {
    paginationModel,
    setPaginationModel,
    searchText,
    setSearchText,
    debouncedSearch,
  };
}
