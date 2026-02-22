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
    headerName: "Display Name",
    flex: 2,
  },

  {
    field: "name",
    headerName: "Product Name",
    flex: 1,
    minWidth: 150,
  },
  {
    field: "product_type",
    headerName: "Product Type",
    width: 120,
    valueGetter: (value, row) => row?.product_type?.name || "N/A",
  },
  {
    field: "sell_price",
    headerName: "Sell Price",
    width: 80,
  },
  {
    field: "cost_price",
    headerName: "Cost Price",
    width: 80,
  },
  {
    field: "stock",
    headerName: "Stock",
    width: 70,
  },
  {
    field: "description",
    headerName: "Description",
    width: 100,
  },
  {
    field: "actions",
    headerName: "Actions",
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
