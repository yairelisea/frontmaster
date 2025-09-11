// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from "react-router-dom";

// NO importes RequireAuth, lo definimos inline para evitar el error de archivo faltante
// import RequireAuth from "./auth/RequireAuth.jsx";
import "./index.css";
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminCampaignsPage from "./admin/AdminCampaignsPage.jsx";
import AdminCampaignDetailPage from "./pages/admin/AdminCampaignDetailPage.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";

// Guard inline (evita el import que está fallando en Netlify)
function RequireAuthInline() {
  const loc = useLocation();
  let token = "";
  try {
    token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      "";
  } catch {}
  if (!token) {
    return <Navigate to="/auth/login" replace state={{ from: loc.pathname + loc.search }} />;
  }
  return <Outlet />;
}

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/admin/campaigns" replace /> },

  // Auth públicas
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [{ path: "login", element: <LoginPage /> }],
  },

  // Admin protegido con el guard inline
  {
    path: "/admin",
    element: <RequireAuthInline />,
    children: [
      {
        path: "",
        element: <AdminLayout />,
        children: [
          { path: "campaigns", element: <AdminCampaignsPage /> },
          { path: "campaigns/:id", element: <AdminCampaignDetailPage /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);