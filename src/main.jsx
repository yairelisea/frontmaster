// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

import AuthLayout from "@/layouts/AuthLayout.jsx";
import LoginPage from "@/pages/auth/LoginPage.jsx";
import RequireAuth from "@/auth/RequireAuth.jsx";

import AdminLayout from "@/admin/AdminLayout.jsx";
import AdminCampaignsPage from "@/admin/AdminCampaignsPage.jsx";
import AdminCampaignDetailPage from "@/pages/admin/AdminCampaignDetailPage.jsx";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/admin/campaigns" replace /> },
  { path: "/auth", element: <AuthLayout />, children: [
    { path: "login", element: <LoginPage /> },
  ]},
  { path: "/admin", element: <RequireAuth />, children: [
    { path: "", element: <AdminLayout />, children: [
      { path: "campaigns", element: <AdminCampaignsPage /> },
      { path: "campaigns/:id", element: <AdminCampaignDetailPage /> },
    ]},
  ]},
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
  </React.StrictMode>
);