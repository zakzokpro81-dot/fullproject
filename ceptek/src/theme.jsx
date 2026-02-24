export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          primary: { main: "#1565c0", light: "#1976d2", dark: "#0d47a1" },
          secondary: { main: "#7b1fa2", light: "#9c27b0", dark: "#4a148c" },
          success: { main: "#2e7d32", light: "#4caf50", dark: "#1b5e20" },
          warning: { main: "#ed6c02", light: "#ff9800", dark: "#e65100" },
          error: { main: "#d32f2f", light: "#ef5350", dark: "#c62828" },
          background: { default: "#f5f5f5", paper: "#ffffff" },
          text: { primary: "#212121", secondary: "#757575" },
        }
      : {
          primary: { main: "#90caf9", light: "#e3f2fd", dark: "#42a5f5" },
          secondary: { main: "#ce93d8", light: "#f3e5f5", dark: "#ab47bc" },
          success: { main: "#66bb6a", light: "#81c784", dark: "#388e3c" },
          warning: { main: "#ffa726", light: "#ffb74d", dark: "#f57c00" },
          error: { main: "#f44336", light: "#e57373", dark: "#d32f2f" },
          background: { default: "#121212", paper: "#1e1e1e" },
          text: { primary: "#e0e0e0", secondary: "#aaaaaa" },
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, fontSize: "1.75rem" },
    h5: { fontWeight: 600, fontSize: "1.5rem" },
    h6: { fontWeight: 600, fontSize: "1.25rem" },
    subtitle1: { fontWeight: 500 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, padding: "8px 20px" },
      },
    },
    MuiDialog: {
      defaultProps: { PaperProps: { elevation: 8 } },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: { border: "none", fontSize: "0.875rem" },
        columnHeaders: { fontWeight: 700 },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small", variant: "outlined" },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});
