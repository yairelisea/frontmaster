// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RequireAuth from "./auth/RequireAuth.jsx";

import AdminLayout from "./admin/AdminLayout.jsx";
import AdminCampaignsPage from "./admin/AdminCampaignsPage.jsx";
import AdminCampaignDetailPage from "./pages/admin/AdminCampaignDetailPage.jsx";

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [{ path: "login", element: <LoginPage /> }],
  },
  {
    element: <RequireAuth />, // 👈 protege todo lo siguiente
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/admin",
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