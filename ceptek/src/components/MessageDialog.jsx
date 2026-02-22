import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

export default function MessageDialog({
  open,
  title = "Notification",
  message,
  severity = "info", // "success" | "error" | "warning" | "info"
  onClose,
}) {
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
        {title}
      </DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" color={buttonColor} onClick={onClose}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
