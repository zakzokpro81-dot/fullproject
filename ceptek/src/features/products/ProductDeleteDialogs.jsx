import * as React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

export function ProductDeleteDialogs({
    openDeleteSelectedDialog,
    setOpenDeleteSelectedDialog,
    selectedIds,
    handleDeleteSelected,
    openDeleteDialog,
    setOpenDeleteDialog,
    selectedProduct,
    handleDeleteConfirm
}) {
    return (
        <>

            <Dialog
                open={openDeleteSelectedDialog}
                onClose={() => setOpenDeleteSelectedDialog(false)}
            >
                <DialogTitle>Delete Confirmation</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete <strong>{selectedIds.size}</strong>{" "}
                    selected products?
                </DialogContent>
                <DialogActions>
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

            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>Delete Confirm</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete{" "}
                    <strong>{selectedProduct?.name}</strong>?
                </DialogContent>
                <DialogActions>
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
