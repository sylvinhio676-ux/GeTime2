import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import { getToken } from "@/services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get("/user");
      setUser(response.data || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const hasRole = (roleName) => {
    if (!roleName) return false;
    return user?.roles?.includes(roleName);
  };

  const can = (permissionName) => {
    if (!permissionName) return false;
    if (hasRole("super_admin") || hasRole("admin")) return true;
    return user?.permissions?.includes(permissionName);
  };

  const value = useMemo(() => ({
    user,
    loading,
    refreshUser: loadUser,
    hasRole,
    can,
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
