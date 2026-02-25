import { IconButton, Stack, Checkbox, Chip } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

const statusColors = { draft: "default", approved: "info", paid: "success" };

export const payrollColumns = (
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
    headerName: t("payroll:employee"),
    flex: 1,
    valueGetter: (value, row) => {
      const emp = row?.employees;
      return emp ? `${emp.first_name} ${emp.last_name}` : "";
    },
  },
  { field: "period", headerName: t("payroll:period"), width: 120 },
  {
    field: "base_salary",
    headerName: t("payroll:baseSalary"),
    width: 130,
    type: "number",
  },
  {
    field: "total_allowances",
    headerName: t("payroll:allowances"),
    width: 130,
    type: "number",
  },
  {
    field: "total_deductions",
    headerName: t("payroll:deductions"),
    width: 130,
    type: "number",
  },
  { field: "net_salary", headerName: t("payroll:netSalary"), width: 130, type: "number" },
  {
    field: "status",
    headerName: t("common:status"),
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        size="small"
        color={statusColors[params.value] || "default"}
      />
    ),
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
