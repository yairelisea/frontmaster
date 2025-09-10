// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// App principal
import App from "./App.jsx";

// Admin (OJO con rutas y mayúsculas/minúsculas)
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminCampaignsPage from "./admin/AdminCampaignsPage.jsx";                 // ← existe en src/admin
import AdminCampaignDetailPage from "./pages/admin/AdminCampaignDetailPage.jsx"; // ← existe en src/pages/admin

// Fallback de error para que no truene con “Unexpected Application Error”
function RouteError() {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontWeight: 600, marginBottom: 8 }}>Algo salió mal</h1>
      <p>Revisa consola/Network para ver el detalle del error.</p>
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