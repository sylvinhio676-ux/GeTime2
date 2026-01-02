import { Navigate } from "react-router-dom";
import { getToken } from "@/services/auth";

export default function RequireAuth({ children }) {
  const token = getToken();
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}
