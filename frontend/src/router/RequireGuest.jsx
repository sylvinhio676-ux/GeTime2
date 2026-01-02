import { Navigate } from "react-router-dom";
import { getToken } from "@/services/auth";

export default function RequireGuest({ children }) {
  const token = getToken();
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
