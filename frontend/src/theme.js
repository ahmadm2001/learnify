import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#6C5DD3" },
    secondary: { main: "#FF758F" },
    error: { main: "#FF5252" },
    background: {
      default: "#F8F9FB",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#111827",
      secondary: "#6B7280",
    },
  },

  // ✅ ONLY TYPOGRAPHY SETTINGS (SAFE)
  typography: {
    fontFamily: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,

    h1: {
      fontWeight: 800,
      fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
      lineHeight: 1.1,
    },

    h2: {
      fontWeight: 800,
      fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
      lineHeight: 1.2,
    },

    h3: {
      fontWeight: 700,
      fontSize: "2rem",
      lineHeight: 1.3,
    },

    h4: {
      fontWeight: 700,
      fontSize: "1.5rem",
    },

    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },

    h6: {
      fontWeight: 600,
      fontSize: "1.1rem",
    },

    body1: {
      fontSize: "1rem", // 16px
      fontWeight: 400,
      lineHeight: 1.6,
    },

    body2: {
      fontSize: "0.9rem", // 14px
      fontWeight: 400,
      lineHeight: 1.6,
    },

    button: {
      fontWeight: 600,
      fontSize: "0.95rem",
      textTransform: "none",
    },
  },

  shape: {
    borderRadius: 14,
  },
});

export default theme;
