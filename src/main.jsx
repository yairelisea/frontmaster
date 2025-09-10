// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";

// Admin (ojo: rutas según tu repo)
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminCampaignsPage from "./admin/AdminCampaignsPage.jsx"; // está en src/admin/
import AdminCampaignDetailPage from "./pages/admin/AdminCampaignDetailPage.jsx"; // está en src/pages/admin/

// Fallback de error para evitar “Unexpected Application Error”
function RouteError() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontWeight: 600, marginBottom: 8 }}>Algo salió mal</h1>
      <p>Revisa consola/Network en el navegador para más detalles.</p>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouteError />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <RouteError />,
    children: [
      { path: "campaigns", element: <AdminCampaignsPage />, errorElement: <RouteError /> },
      { path: "campaigns/:id", element: <AdminCampaignDetailPage />, errorElement: <RouteError /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);