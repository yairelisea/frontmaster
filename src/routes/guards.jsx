// src/routes/guards.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthToken } from "@/lib/api";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getAuthToken();
}

export function isAdminUser() {
  const u = getStoredUser();
  if (!u) return false;
  return u.is_admin === true || u.isAdmin === true || u.role === "admin";
}

/**
 * Protege rutas que requieren sesión (user o admin)
 */
export function RequireAuth() {
  const authed = isAuthenticated();
  const location = useLocation();
  if (!authed) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
}

/**
 * Protege rutas que requieren rol admin
 */
export function RequireAdmin() {
  const authed = isAuthenticated();
  const admin = isAdminUser();
  const location = useLocation();

  if (!authed) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }
  if (!admin) {
    // usuario autenticado pero NO admin → manda a su dashboard de usuario
    return <Navigate to="/user/dashboard" replace />;
  }
  return <Outlet />;
}

/**
 * Si ya estás autenticado y visitas /auth/*,
 * te manda a tu dashboard correcto (admin o user).
 */
export function RedirectIfAuthed() {
  const authed = isAuthenticated();
  if (!authed) return <Outlet />;

  if (isAdminUser()) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/user/dashboard" replace />;
}