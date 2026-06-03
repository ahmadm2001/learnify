import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait until AuthContext finishes checking /api/auth/me/
  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  // Not logged in -> go to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
