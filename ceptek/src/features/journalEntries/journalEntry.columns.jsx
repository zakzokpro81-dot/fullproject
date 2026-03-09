import { IconButton, Stack, Chip, Typography, Tooltip } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";

export const journalEntryColumns = (onEdit, onDelete, onPost, onView, t) => [
  {
    field: "entry_number",
    headerName: t("journalFeature.entryNumber"),
    width: 130,
    renderCell: (params) => (
      <Typography sx={{ fontFamily: "monospace", fontWeight: "bold" }}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "entry_date",
    headerName: t("journalFeature.entryDate"),
    width: 120,
  },
  {
    field: "transaction_type",
    headerName: t("journalFeature.transactionType"),
    width: 130,
    renderCell: (params) => (
      <Chip
        label={t(`journalFeature.type_${params.value}`)}
        size="small"
        variant="outlined"
      />
    ),
  },
  {
    field: "description",
    headerName: t("journalFeature.description"),
    flex: 1.5,
  },
  {
    field: "accountsSummary",
    headerName: t("journalFeature.accounts"),
    flex: 1,
    renderCell: (params) => (
      <Typography variant="body2" noWrap title={params.value}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "totalAmount",
    headerName: t("journalFeature.totalAmount"),
    width: 130,
    headerAlign: "right",
    align: "right",
    renderCell: (params) => (
      <Typography sx={{ fontWeight: "bold" }}>
        {(params.value ?? 0).toLocaleString()}
      </Typography>
    ),
  },
  {
    field: "is_posted",
    headerName: t("journalFeature.status"),
    width: 110,
    renderCell: (params) => (
      <Chip
        label={
          params.value ? t("journalFeature.posted") : t("journalFeature.draft")
        }
        color={params.value ? "success" : "default"}
        size="small"
      />
    ),
  },
  {
    field: "reference",
    headerName: t("journalFeature.reference"),
    width: 120,
  },
  {
    field: "actions",
    headerName: t("common.actions"),
    width: 180,
    sortable: false,
    filterable: false,
    disableExport: true,
    renderCell: (params) => {
      const row = params.row;
      return (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t("journalFeature.entryDetails")}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onView(row);
              }}
              color="info"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {!row.is_posted && (
            <>
              <Tooltip title={t("common.edit")}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(row);
                  }}
                  color="error"
                >
                  <EditNoteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("journalFeature.post")}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPost(row);
                  }}
                  color="success"
                >
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("common.delete")}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(row);
                  }}
                  color="primary"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      );
    },
  },
];
