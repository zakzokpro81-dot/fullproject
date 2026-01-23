
import Box from "@mui/material/Box";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useGetproductByNameQuery } from "../../../src/redux/Product";
import supabase from "../../config/supabase";
import { useState, useEffect } from "react";
export function Dashboard() {
    const [mydata, setMydata] = useState("no");

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase.from("test").select();

            if (error) {
                console.log("error is", error);
                setMydata("error");
                return;
            }

            setMydata(data);
            console.log("sup", data); // ✔ هنا صحيح
        };

        fetchData();
    }, []);

    useEffect(() => {
        console.log("data is", mydata);
    }, [mydata]);



    //const { data, error, isLoading } = useGetproductByNameQuery("products")


    // if (isLoading) {
    //   return (
    //     <>
    //       isloading
    //     </>
    //   )
    // }

    // if (error) {
    //   return (
    //     <>
    //       {error}
    //     </>
    //   )
    // }

    if (mydata) {

        const rows = mydata
        const rows2 = [


            {
                id: 1,
                model: data.data[0].name,
                piece: "ekran",
                Quality: "orjinal",
                marka: "gx",
                Quanity: "2",
                price: "10",
            },
            {
                id: 2,
                model: data.data[1].name,
                piece: "batarya",
                Quality: "orjinal",
                marka: "gx",
                Quanity: "2",
                price: "10",
            },
            {
                id: 3,
                model: data.data[2].name,
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
            {
                id: 8,
                model: "iphone 18",
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

    return (
        <Box sx={{ height: 400, width: "98%" }}>
            <DataGrid
                checkboxSelection
                {...data2}
                initialState={{
                    filter: {
                        filterModel: {
                            items: [],
                            quickFilterValues: ["iphone"],
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
