// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// App principal
import App from "./App.jsx";

// Admin
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminCampaignsPage from "./admin/AdminCampaignsPage.jsx";            // ← ruta correcta
import AdminCampaignDetailPage from "./pages/admin/AdminCampaignDetailPage.jsx"; // ← detalle ya en /pages/admin

// (Opcional) proveedor de auth si ya lo usas; comenta si no existe
// import { AuthProvider } from "./auth/AuthContext.jsx";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
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
