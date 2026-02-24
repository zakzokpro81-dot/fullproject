import { IconButton, Stack, Checkbox, Chip, Typography } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

export const accountColumns = (
  onEdit,
  onDelete,
  selectedIds,
  toggleSelect,
  rows = [],
  toggleSelectAll,
) => [
  {
    field: "select",
    headerName: "",
    width: 60,
    sortable: false,
    disableColumnMenu: true,
    renderHeader: () => {
      const allSelected =
        rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
      return (
        <Checkbox
          checked={allSelected}
          indeterminate={selectedIds.size > 0 && !allSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={toggleSelectAll}
        />
      );
    },
    renderCell: (params) => (
      <Checkbox
        checked={selectedIds.has(params.row.id)}
        onClick={(e) => e.stopPropagation()}
        onChange={() => toggleSelect(params.row.id)}
      />
    ),
  },
  {
    field: "id",
    headerName: "ID",
    width: 80,
  },
  {
    field: "name",
    headerName: "Account Name",
    flex: 1.5,
  },
  {
    field: "account_type",
    headerName: "Type",
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        size="small"
        variant="outlined"
        color={params.value === "bank" ? "primary" : "info"}
      />
    ),
  },
  {
    field: "balance",
    headerName: "Balance",
    width: 130,
    renderCell: (params) => (
      <Typography
        sx={{
          fontWeight: "bold",
          color: params.value >= 0 ? "success.main" : "error.main",
        }}
      >
        {(params.value ?? 0).toLocaleString()}
      </Typography>
    ),
  },
  {
    field: "is_active",
    headerName: "Active",
    width: 100,
    renderCell: (params) => (params.value ? "Yes" : "No"),
  },
  {
    field: "created_at",
    headerName: "Date",
    width: 180,
    valueGetter: (value, row) => {
      if (!row.created_at) return "N/A";
      const date = new Date(row.created_at);
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
    },
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 160,
    sortable: false,
    filterable: false,
    disableExport: true,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onEdit(params.row);
          }}
          color="error"
        >
          <EditNoteIcon />
        </IconButton>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete(params.row);
          }}
          color="primary"
        >
          <DeleteIcon />
        </IconButton>
      </Stack>
    ),
  },
];
