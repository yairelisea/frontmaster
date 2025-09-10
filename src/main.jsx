// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminCampaignsPage from "./admin/AdminCampaignsPage.jsx";
import AdminCampaignDetailPage from "./pages/admin/AdminCampaignDetailPage.jsx";

// Error boundary simple para rutas
function RouteError() {
  // React Router inyecta error en useRouteError, pero como fallback mostramos genérico
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontWeight: 600, marginBottom: 8 }}>Algo salió mal</h1>
      <p>Revisa la consola del navegador y la respuesta de la API.</p>
    </div>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <App />, errorElement: <RouteError /> },
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
