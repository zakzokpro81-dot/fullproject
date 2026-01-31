import React, { useState } from "react";
import ProductForm from "./ProductForm";
import { Button } from "@mui/material";

export const ProductTestPage = () => {
    const [open, setOpen] = useState(false);

    return (
        <div style={{ padding: 20 }}>
            <Button variant="contained" onClick={() => setOpen(true)}>Open Product Form</Button>
            <ProductForm open={open} onClose={() => setOpen(false)} />
        </div>
    );
};


