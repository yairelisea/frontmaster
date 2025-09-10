import AdminLayout from "./admin/AdminLayout";
import UsersPage from "./admin/UsersPage";
import CampaignsPage from "./admin/CampaignsPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import "@/index.css";
import { AuthProvider } from "@/context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);