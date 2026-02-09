import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";

export default function ProductActionDialogs({
  // Save Dialog Props
  openSaveConfirm,
  setOpenSaveConfirm,
  handleSaveConfirm,
  isSaving,
  rowCount,

  // Delete Dialog Props
  openDeleteSelectedDialog,
  setOpenDeleteSelectedDialog,
  selectedIds,
  handleDeleteSelected,
  openDeleteDialog,
  setOpenDeleteDialog,
  selectedProduct,
  handleDeleteConfirm,
}) {
  return (
    <>
      {/* Save Confirmation Dialog */}
      <Dialog
        open={openSaveConfirm}
        onClose={() => !isSaving && setOpenSaveConfirm(false)}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Save Confirmation</DialogTitle>
        <DialogContent>
          Are you sure you want to save <strong>{rowCount}</strong> products?
          This will insert all entries into the database and update inventory.
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenSaveConfirm(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveConfirm}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Confirm & Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Selected Products Dialog */}
      <Dialog
        open={openDeleteSelectedDialog}
        onClose={() => setOpenDeleteSelectedDialog(false)}
      >
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          Are you sure you want to delete{" "}
          <strong>{selectedIds?.size || 0}</strong> selected products?
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteSelectedDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setOpenDeleteSelectedDialog(false);
              handleDeleteSelected();
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Single Product Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Confirm</DialogTitle>
        <DialogContent>
          Are you sure you want to delete{" "}
          <strong>{selectedProduct?.name}</strong>?
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
