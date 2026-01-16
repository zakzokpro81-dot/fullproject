import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { useMovieData } from "@mui/x-data-grid-generator";

const rows = [
  {
    id: 1,
    model: "iphone 11",
    piece: "ekran",
    Quality: "orjinal",
    marka: "gx",
    Quanity: "2",
    price: "10",
  },
  {
    id: 2,
    model: "iphone 12",
    piece: "batarya",
    Quality: "orjinal",
    marka: "gx",
    Quanity: "2",
    price: "10",
  },
  {
    id: 3,
    model: "iphone 13",
    piece: "ekran",
    Quality: "orjinal",
    marka: "gx",
    Quanity: "2",
    price: "10",
  },
  {
    id: 4,
    model: "iphone 14",
    piece: "ekran",
    Quality: "orjinal",
    marka: "gx",
    Quanity: "2",
    price: "10",
  },
  {
    id: 5,
    model: "iphone 15",
    piece: "ekran",
    Quality: "orjinal",
    marka: "gx",
    Quanity: "2",
    price: "10",
  },
  {
    id: 6,
    model: "iphone 16",
    piece: "ekran",
    Quality: "orjinal",
    marka: "gx",
    Quanity: "2",
    price: "10",
  },
  {
    id: 7,
    model: "iphone 17",
    piece: "ekran",
    Quality: "orjinal",
    marka: "gx",
    Quanity: "2",
    price: "10",
  },
];

const columns = [
  {
    field: "model",
    headerName: "model",
    flex: 1,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "piece",
    headerName: "parça",
    flex: 1,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "Quality",
    headerName: "kalite",
    flex: 1,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "marka",
    headerName: "marka",
    flex: 1,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "Quanity",
    headerName: "adet",
    flex: 1,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "price",
    headerName: "fiyat",
    flex: 1,
    align: "center",
    headerAlign: "center",
  },
];

const newData = {
  columns: columns,
  rows: rows,
};
const VISIBLE_FIELDS = [
  "model",
  "piece",
  "Quality",
  "Quality",
  "Quanity",
  "price",
];

export function Dashboard() {
  const data = newData;

  // Otherwise filter will be applied on fields such as the hidden column id
  const columns = React.useMemo(
    () =>
      data.columns.filter((column) => VISIBLE_FIELDS.includes(column.field)),
    [data.columns]
  );

  return (
    <Box sx={{ height: 400, width: "98%" }}>
      <DataGrid
        {...data}
        initialState={{
          filter: {
            filterModel: {
              items: [],
            },
          },
        }}
        disableColumnFilter
        disableDensitySelector
        // @ts-ignore
        columns={columns}
        showToolbar
      />
    </Box>
  );
}
