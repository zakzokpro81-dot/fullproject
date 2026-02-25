import { IconButton, Stack, Checkbox } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

export const supplierColumns = (
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
  { field: "name", headerName: t("suppliers:entity"), flex: 1 },
  { field: "company_name", headerName: t("suppliers:company"), flex: 1 },
  { field: "email", headerName: t("common:email"), flex: 1 },
  { field: "phone", headerName: t("common:phone"), width: 140 },
  {
    field: "supplier_type_name",
    headerName: t("suppliers:supplierType"),
    width: 140,
    valueGetter: (value, row) => row?.supplier_types?.type_name || "",
  },
  {
    field: "is_active",
    headerName: t("common:active"),
    width: 100,
    renderCell: (params) => (params.value ? t("common:active") : t("common:inactive")),
  },
  {
    field: "actions",
    headerName: t("common:actions"),
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
          color="primary"
        >
          <EditNoteIcon />
        </IconButton>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete(params.row);
          }}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      </Stack>
    ),
  },
];
