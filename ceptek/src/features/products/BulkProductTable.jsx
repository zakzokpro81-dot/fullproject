import { useState, Fragment } from "react";
import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Divider,
  Stack,
  Paper,
  Grid,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";
import { ModelAutocomplete } from "./ModelAutocomplete";

function CollapsibleRow({
  row,
  warehouses,
  attributesList,
  onRowUpdate,
  onDelete,
}) {
  const [open, setOpen] = useState(false);

  const handleChange = (field, value) => {
    onRowUpdate({ ...row, [field]: value }, row);
  };

  const handleAttrChange = (slug, value) => {
    const updatedAttrs = { ...(row.attributes || {}), [slug]: value };
    onRowUpdate({ ...row, attributes: updatedAttrs }, row);
  };

  // Unified field styles for consistency
  const fieldStyle = {
    "& .MuiInputBase-root": { fontSize: "0.85rem", backgroundColor: "#fff" },
    "& .MuiInputLabel-root": { fontSize: "0.85rem" },
  };

  return (
    <Fragment>
      {/* Main row */}
      <TableRow
        sx={{
          bgcolor: open ? "rgba(25, 118, 210, 0.04)" : "inherit",
          "&:hover": { bgcolor: "rgba(0, 0, 0, 0.02)" },
        }}
      >
        <TableCell width="50">
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? (
              <KeyboardArrowUpIcon color="primary" />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </TableCell>
        <TableCell
          sx={{
            fontWeight: row.manuallyEditedFields?.length ? "bold" : "normal",
          }}
        >
          {row.name}
        </TableCell>
        <TableCell>{row.part_name}</TableCell>
        <TableCell align="right">{row.sell_price}</TableCell>
        <TableCell align="right">{row.cost_price}</TableCell>
        <TableCell align="right">{row.stock}</TableCell>
        <TableCell>{row.warehouse_name}</TableCell>
        <TableCell align="right">
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <IconButton
              size="small"
              onClick={() => setOpen(!open)}
              color="primary"
            >
              <EditNoteIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(row.id)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>

      {/* Expandable detail row */}
      <TableRow>
        <TableCell
          style={{
            paddingBottom: 0,
            paddingTop: 0,
            borderBottom: open ? "1px solid #e0e0e0" : "none",
          }}
          colSpan={8}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                m: 1,
                p: 2.5,
                borderLeft: "4px solid #1976d2",
                bgcolor: "#fcfcfc",
                borderRadius: "0 4px 4px 0",
                boxShadow: "inset 0px 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              {/* Product details section */}
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1.5,
                  color: "#555",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#1976d2",
                  }}
                />
                Product Specifications
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 3,
                }}
              >
                {/* Model autocomplete */}
                <Box sx={{ minWidth: "250px", flex: "4 1 auto" }}>
                  <ModelAutocomplete
                    label="Model Selection"
                    color="#1976d2"
                    backgroundColor="#1976d2"
                    selectedCategory={row.category}
                    selectedProductType={row.productType}
                    // Use model_id inside object
                    value={
                      row.model_id
                        ? {
                            label: row.name,
                            model_id: row.model_id,
                            brand_id: row.brand_id,
                          }
                        : null
                    }
                    onChange={(model) => {
                      if (model) {
                        onRowUpdate(
                          {
                            ...row,
                            name: model.label,
                            model_id: model.model_id,
                            brand_id: model.brand_id,
                          },
                          row,
                        );
                      }
                    }}
                  />
                </Box>

                {/* Numeric fields */}
                <Box sx={{ width: "100px" }}>
                  <TextField
                    label="Sell Price"
                    type="number"
                    size="small"
                    value={row.sell_price || 0}
                    onChange={(e) =>
                      handleChange("sell_price", Number(e.target.value))
                    }
                    sx={fieldStyle}
                  />
                </Box>

                <Box sx={{ width: "100px" }}>
                  <TextField
                    label="Cost Price"
                    type="number"
                    size="small"
                    value={row.cost_price || 0}
                    onChange={(e) =>
                      handleChange("cost_price", Number(e.target.value))
                    }
                    sx={fieldStyle}
                  />
                </Box>

                <Box sx={{ width: "80px" }}>
                  <TextField
                    label="Stock"
                    type="number"
                    size="small"
                    value={row.stock || 0}
                    onChange={(e) =>
                      handleChange("stock", Number(e.target.value))
                    }
                    sx={fieldStyle}
                  />
                </Box>

                {/* Warehouse */}
                <Box sx={{ minWidth: "180px", flex: "1 1 auto" }}>
                  <Autocomplete
                    options={warehouses || []}
                    getOptionLabel={(o) => o.name || ""}
                    value={
                      warehouses?.find((w) => w.id === row.warehouse_id) || null
                    }
                    onChange={(e, v) =>
                      onRowUpdate(
                        {
                          ...row,
                          warehouse_name: v?.name || "",
                          warehouse_id: v?.id || null,
                        },
                        row,
                      )
                    }
                    renderInput={(p) => (
                      <TextField {...p} label="Warehouse" size="small" />
                    )}
                    sx={fieldStyle}
                  />
                </Box>

                {/* Notes */}
                <Box sx={{ minWidth: "200px", flex: "1 1 auto" }}>
                  <TextField
                    label="Notes"
                    fullWidth
                    size="small"
                    value={row.description || ""}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    sx={fieldStyle}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2.5, borderStyle: "dashed" }} />

              {/* Attributes section */}
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1.5,
                  color: "#555",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#9c27b0",
                  }}
                />
                Technical Attributes
              </Typography>

              <Grid container spacing={2}>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    alignItems: "center",
                    p: 1,
                  }}
                >
                  {attributesList?.map((attr) => (
                    <Box
                      key={attr.id}
                      sx={{
                        minWidth: "150px",
                        maxWidth: "250px",
                        flex: "1 1 auto",
                      }}
                    >
                      {attr.has_options ? (
                        <Autocomplete
                          size="small"
                          options={attr.options || []}
                          getOptionLabel={(o) => o.value || ""}
                          value={
                            attr.options?.find(
                              (opt) =>
                                opt.value === row.attributes?.[attr.slug],
                            ) || null
                          }
                          onChange={(e, v) =>
                            handleAttrChange(attr.slug, v?.value || "")
                          }
                          renderInput={(p) => (
                            <TextField {...p} label={attr.name} size="small" />
                          )}
                          sx={fieldStyle}
                        />
                      ) : (
                        <TextField
                          label={attr.name}
                          fullWidth
                          size="small"
                          value={row.attributes?.[attr.slug] || ""}
                          onChange={(e) =>
                            handleAttrChange(attr.slug, e.target.value)
                          }
                          sx={fieldStyle}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              </Grid>

              <Divider sx={{ my: 2.5, borderStyle: "dashed" }} />

              {/* Unit tracking section (IMEI/Serial) */}
              {row.imei && (
                <>
                  <Divider sx={{ my: 2.5, borderStyle: "dashed" }} />

                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1.5,
                      color: "#555",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#f44336",
                      }}
                    />
                    Unit Tracking Details (IMEI/Serial)
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      alignItems: "center",
                      p: 1,
                      bgcolor: "rgba(244, 67, 54, 0.02)",
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ minWidth: "250px", flex: "1 1 auto" }}>
                      <TextField
                        label="IMEI Number"
                        fullWidth
                        size="small"
                        value={row.imei || ""}
                        onChange={(e) => handleChange("imei", e.target.value)}
                        placeholder="Enter IMEI..."
                        sx={{
                          ...fieldStyle,
                          "& .MuiInputBase-input": {
                            fontFamily: "monospace",
                            fontWeight: "bold",
                            color: "#d32f2f",
                          },
                        }}
                      />
                    </Box>

                    {/* Serial Number field */}
                    <Box sx={{ minWidth: "250px", flex: "1 1 auto" }}>
                      <TextField
                        label="Serial Number"
                        fullWidth
                        size="small"
                        value={row.serial_number || ""}
                        onChange={(e) =>
                          handleChange("serial_number", e.target.value)
                        }
                        placeholder="Enter Serial Number (Optional)..."
                        sx={fieldStyle}
                      />
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

export default function BulkProductTable({
  rows,
  warehouses,
  attributes,
  onRowUpdate,
  setRows,
}) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        mb: 2,
        maxHeight: 600,
        boxShadow: "none",
        border: "1px solid #e0e0e0",
      }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell width="50" sx={{ bgcolor: "#f8f9fa" }} />
            <TableCell
              sx={{ bgcolor: "#f8f9fa", color: "#666", fontWeight: "bold" }}
            >
              Model Name
            </TableCell>
            <TableCell
              sx={{ bgcolor: "#f8f9fa", color: "#666", fontWeight: "bold" }}
            >
              Type
            </TableCell>
            <TableCell
              align="right"
              sx={{ bgcolor: "#f8f9fa", color: "#666", fontWeight: "bold" }}
            >
              Sell
            </TableCell>
            <TableCell
              align="right"
              sx={{ bgcolor: "#f8f9fa", color: "#666", fontWeight: "bold" }}
            >
              Cost
            </TableCell>
            <TableCell
              align="right"
              sx={{ bgcolor: "#f8f9fa", color: "#666", fontWeight: "bold" }}
            >
              Stock
            </TableCell>
            <TableCell
              sx={{ bgcolor: "#f8f9fa", color: "#666", fontWeight: "bold" }}
            >
              Warehouse
            </TableCell>
            <TableCell
              align="right"
              sx={{ bgcolor: "#f8f9fa", color: "#666", fontWeight: "bold" }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <CollapsibleRow
              key={row.id}
              row={row}
              warehouses={warehouses}
              attributesList={attributes}
              onRowUpdate={onRowUpdate}
              onDelete={(id) =>
                setRows((prev) => prev.filter((r) => r.id !== id))
              }
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
