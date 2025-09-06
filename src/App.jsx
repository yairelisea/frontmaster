// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "@/layouts/AdminLayout";
import UserLayout from "@/layouts/UserLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Admin Pages
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import UserManagementPage from "@/pages/admin/UserManagementPage";
import PlansSubscriptionsPage from "@/pages/admin/PlansSubscriptionsPage";
import ActiveCampaignsPage from "@/pages/admin/ActiveCampaignsPage";
import SocialConnectionsPage from "@/pages/admin/SocialConnectionsPage";
import LogsActivityPage from "@/pages/admin/LogsActivityPage";
import GeneralSettingsPage from "@/pages/admin/GeneralSettingsPage";

// User Pages
import UserDashboardPage from "@/pages/user/UserDashboardPage";
import UserCampaignsPage from "@/pages/user/UserCampaignsPage";
import CampaignFormPage from "@/pages/user/CampaignFormPage";
import UserPostsMentionsPage from "@/pages/user/UserPostsMentionsPage";
import UserAnalyticsPage from "@/pages/user/UserAnalyticsPage";
import UserConnectAccountsPage from "@/pages/user/UserConnectAccountsPage";
import UserPlansPage from "@/pages/user/UserPlansPage";
import UserProfileComparisonPage from "@/pages/user/UserProfileComparisonPage";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/AuthContext";

// Rutas protegidas: solo dejan pasar si hay sesión
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return children;
};

// (Opcional) Solo invitados: si ya hay sesión, vete al dashboard
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/user/dashboard" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        {/* Root -> Login */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        {/* Auth */}
        <Route
          path="/auth"
          element={
            <GuestRoute>
              <AuthLayout />
            </GuestRoute>
          }
        >
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* User */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboardPage />} />
          <Route path="campaigns" element={<UserCampaignsPage />} />
          <Route path="campaigns/new" element={<CampaignFormPage />} />
          <Route path="campaigns/edit/:campaignId" element={<CampaignFormPage />} />
          <Route path="posts" element={<UserPostsMentionsPage />} />
          <Route path="analytics" element={<UserAnalyticsPage />} />
          <Route path="connect" element={<UserConnectAccountsPage />} />
          <Route path="plans" element={<UserPlansPage />} />
          <Route path="compare" element={<UserProfileComparisonPage />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="plans" element={<PlansSubscriptionsPage />} />
          <Route path="campaigns" element={<ActiveCampaignsPage />} />
          <Route path="social" element={<SocialConnectionsPage />} />
          <Route path="logs" element={<LogsActivityPage />} />
          <Route path="settings" element={<GeneralSettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;