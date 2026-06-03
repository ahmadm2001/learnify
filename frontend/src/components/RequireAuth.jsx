import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  // Wait until auth is checked
  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  // Not logged in → redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in → allow
  return children;
}
