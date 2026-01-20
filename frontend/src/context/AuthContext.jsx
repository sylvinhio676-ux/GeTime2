import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import { getToken, login as performLogin, logout as performLogout } from "@/services/auth";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const hasRole = useCallback((roleName) => {
    if (!roleName) return false;
    return user?.roles?.includes(roleName);
  }, [user]);

  const can = useCallback((permissionName) => {
    if (!permissionName) return false;
    if (hasRole("super_admin") || hasRole("admin")) return true;
    return user?.permissions?.includes(permissionName);
  }, [user, hasRole]);

  const login = useCallback(
    async (email, password) => {
      await performLogin(email, password);
      await loadUser();
    },
    [loadUser]
  );

  const logout = useCallback(async () => {
    await performLogout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    refreshUser: loadUser,
    hasRole,
    can,
    login,
    logout,
  }), [user, loading, loadUser, hasRole, can, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
