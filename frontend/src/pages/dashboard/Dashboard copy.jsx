import Box from "@mui/material/Box";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import supabase from "../../config/supabase";
import { useState ,useEffect } from "react";
export function Dashboard() {
 const [mydata, setMydata] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    const { data, error } = await supabase.from("test").select();

    if (error) {
      console.log("error is", error);
      return;
    }
    setMydata(data);
  };

  fetchData();
}, []);


    


    const rows=mydata

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
      "modedsdfdl",
      "piece",
      "Quality",
      "Quality",
      "Quanity",
      "price",
    ];

    const data2 = newData;
    return (
      <Box sx={{ minHeightheight: 300, width: "98%" }}>
        <DataGrid
          checkboxSelection
          {...data2}
          initialState={{
            filter: {
              filterModel: {
                items: [],
                quickFilterValues: [],
              },
            },
          }}
          disableColumnFilter
          disableDensitySelector
          // @ts-ignore
          columns={columns}
          showToolbar
          slots={{
            toolbar: GridToolbar,
          }}
        />
      </Box>
    );
  
  
}
