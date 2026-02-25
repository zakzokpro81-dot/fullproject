import { IconButton, Stack, Checkbox, Chip } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

const statusColors = {
  present: "success",
  absent: "error",
  late: "warning",
  leave: "info",
  half_day: "default",
};

export const attendanceColumns = (
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
    headerName: t("attendance:employee"),
    flex: 1,
    valueGetter: (value, row) => {
      const emp = row?.employees;
      return emp ? `${emp.first_name} ${emp.last_name}` : "";
    },
  },
  { field: "work_date", headerName: t("attendance:workDate"), width: 130 },
  { field: "check_in", headerName: t("attendance:checkIn"), width: 110 },
  { field: "check_out", headerName: t("attendance:checkOut"), width: 110 },
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
  { field: "notes", headerName: t("attendance:notes"), flex: 1 },
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
