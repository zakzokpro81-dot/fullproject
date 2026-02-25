import { useState, useMemo, useEffect } from "react";

import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import { TopBar } from "./components/TopBar";
import { SideBar } from "./components/SideBar";
import { getDesignTokens } from "./theme";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Emotion caches for LTR and RTL
const ltrCache = createCache({ key: "mui-ltr" });
const rtlCache = createCache({
  key: "mui-rtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

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
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

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
  const theme = useMemo(
    () =>
      createTheme({
        ...getDesignTokens(mode),
        direction: isRtl ? "rtl" : "ltr",
      }),
    [mode, isRtl],
  );

  // Sync document direction and lang attribute with language changes
  useEffect(() => {
    document.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRtl]);

  return (
    <CacheProvider value={isRtl ? rtlCache : ltrCache}>
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
    </CacheProvider>
  );
}
