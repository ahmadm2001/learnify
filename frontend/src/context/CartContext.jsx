// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import API from "../lib/api";
import { AuthContext } from "./AuthContext";

const CartContext = createContext({
  cartCount: 0,
  refreshCartCount: () => {},
});

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = async () => {
    if (!user) {
      setCartCount(0);
      return;
    }
    try {
      const { data } = await API.get("/api/cart/");
      setCartCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      console.error("Failed to load cart count", err);
    }
  };

  // load when user changes (login / logout)
  useEffect(() => {
    refreshCartCount();
  }, [user]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
