import { IconButton, Stack, Chip, Checkbox } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

export const customerColumns = (
  onEdit,
  onDelete,
  selectedIds,
  toggleSelect,
  rows = [],
  toggleSelectAll,
  t,
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
  { field: "id", headerName: "ID", width: 80 },
  { field: "name", headerName: t("customersFeature.fullName"), flex: 1.2 },
  { field: "store_name", headerName: t("customersFeature.storeName"), flex: 1 },
  {
    field: "customer_type",
    headerName: t("customersFeature.customerType"),
    width: 130,
    valueGetter: (value, row) => row?.customer_types?.type_name || "N/A",
  },
  { field: "phone", headerName: t("customersFeature.phoneNumber"), width: 130 },
  {
    field: "tax_number",
    headerName: t("customersFeature.taxNumber"),
    width: 130,
  },
  {
    field: "is_active",
    headerName: t("common.status"),
    width: 100,
    renderCell: (params) => (
      <Chip
        label={
          params.row?.is_active ? t("common.active") : t("common.inactive")
        }
        color={params.row?.is_active ? "success" : "default"}
        size="small"
      />
    ),
  },
  {
    field: "actions",
    headerName: t("common.actions"),
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
