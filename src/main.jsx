// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import "./index.css"; // <-- imprescindible para Tailwind

// Contexto de auth (el tuyo)
import { AuthProvider } from "@/context/AuthContext";

// Páginas existentes
import App from "./App.jsx";

// Layouts y páginas de auth
import AuthLayout from "@/layouts/AuthLayout.jsx";
import LoginPage from "@/pages/auth/LoginPage.jsx";

// Admin + páginas
import AdminLayout from "@/admin/AdminLayout.jsx";
import AdminCampaignsPage from "@/admin/AdminCampaignsPage.jsx";
import AdminCampaignDetailPage from "@/pages/admin/AdminCampaignDetailPage.jsx";

// Wrapper de rutas protegidas
import RequireAuth from "@/auth/RequireAuth.jsx";

function RouteError() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">Algo salió mal</h1>
      <p>Revisa consola/Network para más detalles.</p>
    </div>
  );
}

const router = createBrowserRouter([
  // raíz: redirige a /auth/login o a lo que tengas en App
  { path: "/", element: <App />, errorElement: <RouteError /> },

  // Auth (público)
  {
    path: "/auth",
    element: <AuthLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      { path: "login", element: <LoginPage /> },
    ],
  },

  // Admin (protegido)
  {
    path: "/admin",
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="campaigns" replace /> },
      { path: "campaigns", element: <AdminCampaignsPage /> },
      { path: "campaigns/:id", element: <AdminCampaignDetailPage /> },
    ],
  },

  // 404
  { path: "*", element: <Navigate to="/" replace /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);