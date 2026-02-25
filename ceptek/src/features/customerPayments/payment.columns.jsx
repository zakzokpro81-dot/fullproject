import { IconButton, Stack, Checkbox } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

export const paymentColumns = (
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
  { field: "date", headerName: t("common:date"), width: 120 },
  {
    field: "invoice_info",
    headerName: `${t("customerPayments:invoice")} / ${t("customerPayments:customer")}`,
    flex: 1.5,
    valueGetter: (value, row) => {
      const inv = row?.invoices;
      const custName = inv?.customers?.name || "Unknown";
      const invNum = inv?.invoice_number || `#${inv?.id}`;
      return `${invNum} - ${custName}`;
    },
  },
  { field: "amount", headerName: t("common:amount"), width: 110, type: "number" },
  { field: "notes", headerName: t("common:notes"), flex: 1.5 },
  {
    field: "actions",
    headerName: t("common:actions"),
    width: 120,
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
        >
          <EditNoteIcon />
        </IconButton>
        <IconButton
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(params.row);
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Stack>
    ),
  },
];
