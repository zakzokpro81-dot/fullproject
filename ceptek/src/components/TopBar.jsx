import {
  IconButton,
  styled,
  alpha,
  Toolbar,
  Typography,
  InputBase,
  Stack,
  Box,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TranslateIcon from "@mui/icons-material/Translate";
import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";
import { useTranslation } from "react-i18next";
const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      // @ts-ignore
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));
const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

export function TopBar({ open, handleDrawerOpen, setMode }) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [langAnchor, setLangAnchor] = useState(null);

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    setLangAnchor(null);
    // Update document direction for RTL languages
    document.dir = code === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = code;
  };

  return (
    <AppBar
      position="fixed"
      // @ts-ignore
      open={open}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label={t("common.openDrawer")}
          onClick={handleDrawerOpen}
          edge="start"
          sx={[
            {
              marginRight: 5,
            },
            open && { display: "none" },
          ]}
        >
          <MenuIcon />
        </IconButton>
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder={t("common.search")}
            inputProps={{ "aria-label": "search" }}
          />
        </Search>
        <Box flexGrow={1}></Box>
        <Stack direction={"row"}>
          {/* Language switcher */}
          <IconButton
            color="inherit"
            aria-label={t("common.language")}
            onClick={(e) => setLangAnchor(e.currentTarget)}
          >
            <TranslateIcon />
          </IconButton>
          <Menu
            anchorEl={langAnchor}
            open={Boolean(langAnchor)}
            onClose={() => setLangAnchor(null)}
          >
            {LANGUAGES.map((lang) => (
              <MenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                selected={i18n.language === lang.code}
              >
                <ListItemIcon sx={{ fontSize: "1.2rem", minWidth: 32 }}>
                  {lang.flag}
                </ListItemIcon>
                <ListItemText>{lang.label}</ListItemText>
                {i18n.language === lang.code && (
                  <CheckIcon fontSize="small" sx={{ ml: 1 }} />
                )}
              </MenuItem>
            ))}
          </Menu>

          {theme.palette.mode === "light" ? (
            <IconButton
              color="inherit"
              aria-label={t("common.switchToDark")}
              onClick={() => {
                localStorage.setItem("currentMode", "dark");
                setMode("dark");
              }}
            >
              <LightModeOutlinedIcon />
            </IconButton>
          ) : (
            <IconButton
              color="inherit"
              aria-label={t("common.switchToLight")}
              onClick={() => {
                localStorage.setItem("currentMode", "light");
                setMode("light");
              }}
            >
              <DarkModeOutlinedIcon />
            </IconButton>
          )}
          <IconButton color="inherit" aria-label={t("common.notifications")}>
            <NotificationsOutlinedIcon />
          </IconButton>
          <IconButton color="inherit" aria-label={t("common.settings")}>
            <SettingsOutlinedIcon />
          </IconButton>
          <IconButton color="inherit" aria-label={t("common.profile")}>
            <Person2OutlinedIcon />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
