import { IconButton, Stack } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * Shared action-column renderer for DataGrid rows.
 *
 * @param {object}   params   - DataGrid cell params
 * @param {Function} onEdit   - Called with the row data
 * @param {Function} onDelete - Called with the row data
 */
export default function ActionColumn({ params, onEdit, onDelete }) {
  return (
    <Stack direction="row" spacing={1}>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onEdit(params.row);
        }}
        color="primary"
        size="small"
        aria-label="edit"
      >
        <EditNoteIcon />
      </IconButton>

      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onDelete(params.row);
        }}
        color="error"
        size="small"
        aria-label="delete"
      >
        <DeleteIcon />
      </IconButton>
    </Stack>
  );
}

/**
 * Helper to create the actions column definition for a DataGrid.
 */
export function getActionsColumn(onEdit, onDelete) {
  return {
    field: "actions",
    headerName: "Actions",
    width: 140,
    sortable: false,
    filterable: false,
    disableExport: true,
    renderCell: (params) => (
      <ActionColumn params={params} onEdit={onEdit} onDelete={onDelete} />
    ),
  };
}
