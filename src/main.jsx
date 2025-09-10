import AdminLayout from "./layouts/AdminLayout";
import UsersPage from "./admin/UsersPage";
import CampaignsPage from "./admin/AdminCampaignsPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";


// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import "@/index.css";
import { AuthProvider } from "@/context/AuthContext";


const router = createBrowserRouter([
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "campaigns", element: <AdminCampaignsPage /> },
      { path: "campaigns/:id", element: <AdminCampaignDetailPage /> },
    ],
  },

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);