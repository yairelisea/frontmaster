// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Páginas existentes de tu app (ajusta si tus rutas cambian)
import App from "./App.jsx";

// Admin
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminCampaignsPage from "./pages/admin/AdminCampaignsPage.jsx";
import AdminCampaignDetailPage from "./pages/admin/AdminCampaignDetailPage.jsx";

// (Opcional) proveedor de auth si ya lo usas; comenta si no existe
// import { AuthProvider } from "./auth/AuthContext.jsx";

const router = createBrowserRouter([
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
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <AuthProvider> */}
    <RouterProvider router={router} />
    {/* </AuthProvider> */}
  </React.StrictMode>
);