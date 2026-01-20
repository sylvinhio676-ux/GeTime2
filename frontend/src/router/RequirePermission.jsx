import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

export default function RequirePermission({ permission, denyRoles = [], children }) {
  const { can, hasRole, loading } = useAuth();

  if (loading) {
    return null;
  }

  const denied = denyRoles.some((role) => hasRole(role));
  if (denied || (permission && !can(permission))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
