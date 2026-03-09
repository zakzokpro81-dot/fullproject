import {
  Drawer,
  Box,
  Typography,
  Stack,
  Divider,
  IconButton,
  Chip,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

export default function JournalEntryDetailsDrawer({ entry, onClose }) {
  const { t } = useTranslation();
  if (!entry) return null;

  const lines = entry.journal_entry_lines || [];
  const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);

  return (
    <Drawer
      anchor="right"
      open={!!entry}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 560 }, bgcolor: "background.default" },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight="bold" color="primary">
            {t("journalFeature.entryDetails")}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 3 }} />

        {/* Info Card */}
        <Paper
          variant="outlined"
          sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: "background.paper" }}
        >
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {t("journalFeature.entryNumber")}
              </Typography>
              <Typography fontWeight="bold" fontFamily="monospace">
                {entry.entry_number}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {t("journalFeature.status")}
              </Typography>
              <Chip
                label={
                  entry.is_posted
                    ? t("journalFeature.posted")
                    : t("journalFeature.draft")
                }
                color={entry.is_posted ? "success" : "default"}
                size="small"
              />
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {t("journalFeature.entryDate")}
              </Typography>
              <Typography>{entry.entry_date}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {t("journalFeature.transactionType")}
              </Typography>
              <Chip
                label={t(`journalFeature.type_${entry.transaction_type}`)}
                size="small"
                variant="outlined"
              />
            </Stack>

            {entry.reference && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  {t("journalFeature.reference")}
                </Typography>
                <Typography>{entry.reference}</Typography>
              </Stack>
            )}

            {entry.description && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  {t("journalFeature.description")}
                </Typography>
                <Typography sx={{ maxWidth: 250, textAlign: "right" }}>
                  {entry.description}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Paper>

        {/* Lines Table */}
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
          {t("journalFeature.entryLines")}
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>
                  {t("journalFeature.account")}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  {t("journalFeature.debit")}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  {t("journalFeature.credit")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <Typography variant="body2">
                      {line.accounts?.account_code} — {line.accounts?.name}
                    </Typography>
                    {line.description && (
                      <Typography variant="caption" color="text.secondary">
                        {line.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {line.debit > 0 ? line.debit.toLocaleString() : "—"}
                  </TableCell>
                  <TableCell align="right">
                    {line.credit > 0 ? line.credit.toLocaleString() : "—"}
                  </TableCell>
                </TableRow>
              ))}

              {/* Totals */}
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell>
                  <Typography fontWeight="bold">
                    {t("journalFeature.totals")}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">
                    {totalDebit.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">
                    {totalCredit.toLocaleString()}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Drawer>
  );
}
