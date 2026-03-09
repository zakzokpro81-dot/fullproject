import { IconButton, Stack, Checkbox, Chip, Typography } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

const TYPE_COLORS = {
  asset: "info",
  liability: "warning",
  equity: "secondary",
  revenue: "success",
  expense: "error",
};

export const accountColumns = (
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
    field: "account_code",
    headerName: t("accountsFeature.accountCode"),
    width: 120,
    renderCell: (params) => (
      <Typography sx={{ fontFamily: "monospace", fontWeight: "bold" }}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "name",
    headerName: t("accountsFeature.accountName"),
    flex: 1.5,
  },
  {
    field: "account_type",
    headerName: t("accountsFeature.accountType"),
    width: 130,
    renderCell: (params) => (
      <Chip
        label={t(`accountsFeature.type_${params.value}`)}
        size="small"
        variant="outlined"
        color={TYPE_COLORS[params.value] || "default"}
      />
    ),
  },
  {
    field: "account_subtype",
    headerName: t("accountsFeature.accountSubtype"),
    width: 150,
    renderCell: (params) =>
      params.value ? t(`accountsFeature.subtype_${params.value}`) : "—",
  },
  {
    field: "balance",
    headerName: t("accountsFeature.balance"),
    width: 140,
    headerAlign: "right",
    align: "right",
    renderCell: (params) => (
      <Typography
        sx={{
          fontWeight: "bold",
          color: params.value >= 0 ? "success.main" : "error.main",
        }}
      >
        {(params.value ?? 0).toLocaleString()}
      </Typography>
    ),
  },
  {
    field: "is_active",
    headerName: t("common.active"),
    width: 100,
    renderCell: (params) => (params.value ? t("common.yes") : t("common.no")),
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
