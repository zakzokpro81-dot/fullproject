// family.columns.jsx
// DataGrid column definitions for Families

import { IconButton, Stack, Checkbox } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

export const familyColumns = (
  onEdit,
  onDelete,
  selectedIds,
  toggleSelect,
  rows = [],
  toggleSelectAll,
  t,
) => [
  // ── Checkbox selection column ──
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

  // ── Data columns ──
  {
    field: "id",
    headerName: "ID",
    width: 80,
  },
  {
    field: "name",
    headerName: t("families:familyName"),
    flex: 1,
  },
  {
    field: "brand_name",
    headerName: t("families:brand"),
    width: 150,
    valueGetter: (value, row) => row?.brands?.name || "",
  },
  {
    field: "product_type_id",
    headerName: t("families:productType"),
    width: 150,
    valueGetter: (value, row) => row?.product_types?.name || "",
  },
  {
    field: "slug",
    headerName: t("families:slug"),
    width: 150,
  },
  {
    field: "is_active",
    headerName: t("common:active"),
    width: 120,
    renderCell: (params) => (params.value ? t("common:active") : t("common:inactive")),
  },

  // ── Actions column ──
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
