// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Puedes usar tus utilidades existentes de la API.
// Si tu api.js ya exporta login/me/logout úsalo; si no, este contexto
// hace la llamada a /auth/me directamente.
import {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  login as apiLogin, // opcional: si prefieres usar el login de api.js
} from "@/lib/api";

const AuthContext = createContext(null);

async function fetchMeDirect() {
  const base = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  const token = getAuthToken();
  if (!base || !token) throw new Error("No token/base URL");

  const res = await fetch(`${base}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`ME failed: ${res.status} ${txt}`);
  }
  return res.json();
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    // Intenta hidratar de localStorage por si guardaste el user en el login
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!getAuthToken();

  const persistUser = useCallback((u) => {
    setUser(u);
    try {
      if (u) localStorage.setItem("user", JSON.stringify(u));
      else localStorage.removeItem("user");
    } catch {}
  }, []);

  const hardLogout = useCallback(() => {
    clearAuthToken();
    persistUser(null);
    navigate("/auth/login", { replace: true });
  }, [navigate, persistUser]);

  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      persistUser(null);
      return null;
    }
    const me = await fetchMeDirect();
    persistUser(me);
    return me;
  }, [persistUser]);

  // Bootstrap: valida token al montar
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          persistUser(null);
          return;
        }
        const me = await fetchMeDirect();
        if (!active) return;
        persistUser(me);
      } catch {
        if (!active) return;
        hardLogout();
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [hardLogout, persistUser]);

  // Opcional: responder a cambios de token en otras pestañas
  useEffect(() => {
    function onStorage(e) {
      if (e.key === "auth_token") {
        // Si se borró el token en otra pestaña → salir
        if (!e.newValue) {
          hardLogout();
        } else {
          // Si se estableció uno nuevo, revalidar
          refreshUser().catch(() => hardLogout());
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [hardLogout, refreshUser]);

  // Helper de login (opcional, por si quieres centralizarlo aquí)
  const login = useCallback(
    async ({ email, password }) => {
      // Si ya usas login() desde api.js en tu LoginPage, puedes omitir esto.
      // Aquí lo centralizamos por si prefieres:
      const base = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

      const res = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(body || "Login failed");
      }

      const data = await res.json();
      const token = data?.access_token || data?.token;
      if (!token) throw new Error("No token returned");

      setAuthToken(token);
      // usar /auth/me para datos frescos
      const me = await refreshUser();
      return me || data?.user || null;
    },
    [refreshUser]
  );

  // Exponer logout manual
  const logout = useCallback(() => {
    hardLogout();
  }, [hardLogout]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      login,       // opcional
      logout,      // para botones de cerrar sesión
      refreshUser, // forzar revalidación cuando quieras
      setUser: persistUser,
    }),
    [user, isAuthenticated, loading, login, logout, refreshUser, persistUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}