import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  login as apiLogin,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
} from "@/lib/api";

// Forma del contexto
const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async (_creds) => {},
  logout: () => {},
  setUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getAuthToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión en el primer render
  useEffect(() => {
    const t = getAuthToken();
    if (t) {
      setToken(t);
      // Puedes intentar cargar /auth/me si lo tienes en tu backend.
      // Por ahora, marcamos autenticado con un user mínimo.
      setUser((prev) => prev ?? { email: "session@restored" });
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await apiLogin({ email, password });
      // apiLogin ya guarda el token si viene como access_token/token,
      // pero por si acaso tomamos el valor y guardamos estado local:
      const t = data?.access_token || data?.token || getAuthToken();
      if (t) {
        setAuthToken(t);
        setToken(t);
      }
      // Si el backend devuelve user úsalo; si no, crea uno básico
      const u = data?.user || { email };
      setUser(u);
      return { ok: true, data };
    } catch (err) {
      // Limpia por si quedó algo inconsistente
      clearAuthToken();
      setToken(null);
      setUser(null);
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      loading,
      login,
      logout,
      setUser,
    }),
    [isAuthenticated, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook de conveniencia
export const useAuth = () => useContext(AuthContext);