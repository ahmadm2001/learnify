import { createContext, useState, useEffect, useContext } from "react";
import API from "../lib/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const { data } = await API.get("/api/auth/me/");
      setUser(data);
    } catch (err) {
      console.error("Failed to load user", err);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  useEffect(() => {
    const initialize = async () => {
      await loadUser();
      setLoading(false);
    };
    initialize();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loadUser,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ✅ ADD THIS */
export function useAuth() {
  return useContext(AuthContext);
}
