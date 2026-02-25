import { IconButton, Stack, Checkbox } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

export const productTypeColumns = (
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
  {
    field: "name",
    headerName: t("common:name"),
    flex: 1,
  },
  {
    field: "slug",
    headerName: t("productTypesFeature:slug"),
    flex: 1,
  },
  {
    field: "category",
    headerName: t("productTypesFeature:category"),
    flex: 1,
    valueGetter: (value, row) => row?.product_categories?.name || "",
  },
  {
    field: "is_active",
    headerName: t("common:active"),
    width: 120,
    renderCell: (params) => (params.value ? t("common:active") : t("common:inactive")),
  },
  {
    field: "variant_strategy_id",
    headerName: t("productTypesFeature:productStructure"),
    flex: 1,
    valueGetter: (value, row) => row?.variant_strategies?.name || "",
  },
  {
    field: "tracking_type_id",
    headerName: t("productTypesFeature:trackingType"),
    flex: 1,
    valueGetter: (value, row) => row?.tracking_types?.name || "",
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
