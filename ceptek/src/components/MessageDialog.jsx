import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export default function MessageDialog({
  open,
  title,
  message,
  severity = "info", // "success" | "error" | "warning" | "info"
  onClose,
}) {
  const { t } = useTranslation();
  const titleColor = {
    success: "success.main",
    error: "error.main",
    warning: "warning.main",
    info: undefined,
  }[severity];

  const buttonColor =
    severity === "error"
      ? "error"
      : severity === "warning"
        ? "warning"
        : "primary";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ color: titleColor, fontWeight: "bold" }}>
        {title || t("common.notification")}
      </DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" color={buttonColor} onClick={onClose}>
          {t("common.ok")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
