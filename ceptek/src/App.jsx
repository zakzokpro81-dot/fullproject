import { useState, useMemo } from "react";

import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import { TopBar } from "./components/TopBar";
import { SideBar } from "./components/SideBar";
import { getDesignTokens } from "./theme";
import { Outlet } from "react-router-dom";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

export default function App() {
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const [mode, setMode] = useState(
    localStorage.getItem("currentMode")
      ? localStorage.getItem("currentMode")
      : "light",
  );
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />

        <TopBar
          setMode={setMode}
          open={open}
          handleDrawerOpen={handleDrawerOpen}
        />

        <SideBar open={open} handleDrawerClose={handleDrawerClose} />

        <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
          <DrawerHeader />

          <Box
            sx={{
              flexGrow: 1,
              width: "100%",
              minWidth: 0,
              overflowX: "hidden",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
