// src/auth/RequireAuth.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getAuthToken } from "@/lib/api";

export default function RequireAuth() {
  const { token } = useAuth();         // del contexto
  const stored = getAuthToken();       // fallback por si el refresh pierde contexto
  const loc = useLocation();

  if (!(token || stored)) {
    return <Navigate to="/auth/login" replace state={{ from: loc.pathname + loc.search }} />;
  }
  return <Outlet />;
}