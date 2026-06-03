import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme.js";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ✅ IMPORT AUTH PROVIDER
import { AuthProvider } from "./context/AuthContext.jsx";
// ✅ IMPORT CART PROVIDER
import { CartProvider } from "./context/CartContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
