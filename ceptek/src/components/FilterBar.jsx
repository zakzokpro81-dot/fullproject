import { Box, TextField } from "@mui/material";

/**
 * Shared search / filter bar for list pages.
 *
 * @param {object}   props
 * @param {string}   props.searchText       - Current search value
 * @param {Function} props.onSearchChange   - Called with new value
 * @param {string}   [props.placeholder]    - Input placeholder (default "Search…")
 * @param {React.ReactNode} [props.children] - Extra filter controls rendered after the search box
 */
export default function FilterBar({
  searchText,
  onSearchChange,
  placeholder = "Search…",
  children,
}) {
  return (
    <Box display="flex" gap={2} mb={2} flexWrap="wrap" alignItems="center">
      <TextField
        label={placeholder}
        variant="outlined"
        size="small"
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ minWidth: 250, maxWidth: 400 }}
      />
      {children}
    </Box>
  );
}
