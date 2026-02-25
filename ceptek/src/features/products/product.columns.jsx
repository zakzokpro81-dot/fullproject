import { IconButton, Stack, Checkbox } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

export const productColumns = (
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
    field: "display_name",
    headerName: t("productsFeature.displayName"),
    flex: 2,
  },

  {
    field: "name",
    headerName: t("productsFeature.productName"),
    flex: 1,
    minWidth: 150,
  },
  {
    field: "product_type",
    headerName: t("productsFeature.productType"),
    width: 120,
    valueGetter: (value, row) => row?.product_type?.name || "N/A",
  },
  {
    field: "sell_price",
    headerName: t("productsFeature.sellPrice"),
    width: 80,
  },
  {
    field: "cost_price",
    headerName: t("productsFeature.costPrice"),
    width: 80,
  },
  {
    field: "stock",
    headerName: t("productsFeature.stock"),
    width: 70,
  },
  {
    field: "description",
    headerName: t("productsFeature.generalNotes"),
    width: 100,
  },
  {
    field: "actions",
    headerName: t("common.actions"),
    width: 160,
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
