import { IconButton, Stack, Checkbox, Chip } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

const statusColors = {
  active: "success",
  on_leave: "warning",
  terminated: "error",
};

export const employeeColumns = (
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
  { field: "first_name", headerName: t("employees.firstName"), flex: 1 },
  { field: "last_name", headerName: t("employees.lastName"), flex: 1 },
  { field: "email", headerName: t("common.email"), flex: 1 },
  { field: "phone", headerName: t("common.phone"), width: 140 },
  {
    field: "department_name",
    headerName: t("employees.department"),
    flex: 1,
    valueGetter: (value, row) => row?.departments?.name || "",
  },
  {
    field: "job_title_name",
    headerName: t("employees.jobTitle"),
    flex: 1,
    valueGetter: (value, row) => row?.job_titles?.title || "",
  },
  {
    field: "base_salary",
    headerName: t("employees.baseSalary"),
    width: 130,
    type: "number",
  },
  {
    field: "employment_status",
    headerName: t("employees.employmentStatus"),
    width: 130,
    renderCell: (params) => {
      const statusLabels = {
        active: t("employees.statusActive"),
        on_leave: t("employees.statusOnLeave"),
        terminated: t("employees.statusTerminated"),
      };
      return (
        <Chip
          label={statusLabels[params.value] || params.value}
          size="small"
          color={statusColors[params.value] || "default"}
        />
      );
    },
  },
  {
    field: "is_active",
    headerName: t("common.active"),
    width: 100,
    renderCell: (params) => (params.value ? t("common.active") : t("common.inactive")),
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
