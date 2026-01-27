import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

export default function RequireTeacher({ children }) {
  const { hasRole, loading } = useAuth();

  if (loading) return null;
  if (!hasRole("teacher")) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
