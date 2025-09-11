// src/auth/RequireAuth.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

function getToken() {
  try {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      ""
    );
  } catch {
    return "";
  }
}

export default function RequireAuth() {
  const token = getToken();
  const loc = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: loc.pathname + loc.search }}
      />
    );
  }
  return <Outlet />;
}