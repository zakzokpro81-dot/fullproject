import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";

/**
 * Reusable form dialog wrapper.
 *
 * @param {object}  props
 * @param {boolean} props.open       - Whether the dialog is visible
 * @param {string}  props.title      - Dialog title text
 * @param {Function} props.onClose   - Called when Cancel / backdrop click
 * @param {Function} props.onSubmit  - Called when Save is clicked
 * @param {boolean} props.isPending  - Disables buttons & shows spinner
 * @param {string}  [props.maxWidth] - MUI maxWidth breakpoint (default "sm")
 * @param {React.ReactNode} props.children - Form fields
 */
export default function FormDialog({
  open,
  title,
  onClose,
  onSubmit,
  isPending = false,
  maxWidth = "sm",
  children,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth}>
      <DialogTitle sx={{ fontWeight: "bold" }}>{title}</DialogTitle>

      <DialogContent dividers>{children}</DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={isPending}
          startIcon={
            isPending ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
