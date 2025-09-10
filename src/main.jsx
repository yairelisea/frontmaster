// en src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, useRouteError, isRouteErrorResponse } from "react-router-dom";
import App from "./App.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminCampaignsPage from "./admin/AdminCampaignsPage.jsx";
import AdminCampaignDetailPage from "./pages/admin/AdminCampaignDetailPage.jsx";

// NUEVO: Error detallado
function RouteError() {
  const err = useRouteError();
  let title = "Algo salió mal";
  let details = "";

  if (isRouteErrorResponse(err)) {
    title = `Error ${err.status}`;
    details = JSON.stringify(err.data || {}, null, 2);
  } else if (err instanceof Error) {
    title = err.name || "Error";
    details = err.message || String(err);
  } else {
    details = JSON.stringify(err, null, 2);
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontWeight: 700, marginBottom: 8 }}>{title}</h1>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f6f8fa", padding: 12, borderRadius: 8, fontSize: 12 }}>
        {details}
      </pre>
      <p style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
        Revisa que <code>VITE_API_URL</code> esté bien y que tengas un <code>access_token</code> en localStorage.
      </p>
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