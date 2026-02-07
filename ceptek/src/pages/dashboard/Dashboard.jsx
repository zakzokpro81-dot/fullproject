import React, { useEffect, useState } from "react";
import supabase from "../../config/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from "@mui/material";

export  function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: modelsData, error } = await supabase
        .from("models")
        .select(`
          id,
          name,
          family (
            id,
            name,
            brand (
              id,
              name
            )
          )
        `);

      if (error) {
        console.log("Error fetching data:", error);
        setLoading(false);
        return;
      }

      // تحويل البيانات لتكون بالشكل المطلوب
      const formatted = modelsData.map((item) => ({
        id: item.id,
        brand: item.family.brand.name,
        family: item.family.name,
        model: item.name,
      }));

      setData(formatted);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
          
            <TableCell>Model</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
               
{row.brand} {row.family} {row.model}
               
                
                </TableCell>
             
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
