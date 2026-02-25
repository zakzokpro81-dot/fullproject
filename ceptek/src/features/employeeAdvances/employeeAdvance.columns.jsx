import { IconButton, Stack, Checkbox, Chip } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

const statusColors = {
  pending: "warning",
  approved: "info",
  repaid: "success",
};

export const employeeAdvanceColumns = (
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
    field: "employee_name",
    headerName: t("employeeAdvances.employee"),
    flex: 1,
    valueGetter: (value, row) => {
      const emp = row?.employees;
      return emp ? `${emp.first_name} ${emp.last_name}` : "";
    },
  },
  { field: "amount", headerName: t("common.amount"), width: 130, type: "number" },
  {
    field: "remaining_amount",
    headerName: t("employeeAdvances.remaining"),
    width: 130,
    type: "number",
  },
  { field: "reason", headerName: t("employeeAdvances.reason"), flex: 1 },
  {
    field: "status",
    headerName: t("common.status"),
    width: 120,
    renderCell: (params) => (
      <Chip
        label={t(`employeeAdvances.${params.value}`)}
        size="small"
        color={statusColors[params.value] || "default"}
      />
    ),
  },
  {
    field: "account_name",
    headerName: t("employeeAdvances.account"),
    width: 150,
    valueGetter: (value, row) => row?.accounts?.name || "",
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
