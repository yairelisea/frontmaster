// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, setAuthToken, clearAuthToken } from "@/lib/api";

const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  setUser: () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getAuthToken());
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  });

  useEffect(() => {
    if (token) setAuthToken(token);
    else clearAuthToken();
  }, [token]);

  const login = async ({ token: t, user: u }) => {
    if (t) setToken(t);
    if (u) localStorage.setItem("user", JSON.stringify(u));
    setUser(u || null);
  };

  const logout = () => {
    clearAuthToken();
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}