// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import RequireAuth from "@/auth/RequireAuth.jsx";
import AuthLayout from "@/layouts/AuthLayout.jsx";
import LoginPage from "@/pages/auth/LoginPage.jsx";

import AdminLayout from "@/admin/AdminLayout.jsx";
import AdminCampaignsPage from "@/admin/AdminCampaignsPage.jsx";
import AdminCampaignDetailPage from "@/pages/admin/AdminCampaignDetailPage.jsx";

const router = createBrowserRouter([
  // Redirige la raíz al Admin (opcional pero útil hoy)
  { path: "/", element: <Navigate to="/admin/campaigns" replace /> },

  // Bloque /auth con tu AuthLayout (login público)
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
    ],
  },

  // Bloque /admin protegido
  {
    path: "/admin",
    element: <RequireAuth />,
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
  <React.StrictMode><RouterProvider router={router} /></React.StrictMode>
);