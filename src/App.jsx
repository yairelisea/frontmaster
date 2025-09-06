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

// Guards
import { RequireAuth, RequireAdmin, RedirectIfAuthed } from "@/routes/guards";

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        {/* Home: si quieres que el root vaya directo al login */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        {/* Auth (si ya estás logueado te manda a tu dashboard correcto) */}
        <Route path="/auth" element={<RedirectIfAuthed />}>
          <Route element={<AuthLayout />}>
            <Route index element={<Navigate to="login" replace />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
        </Route>

        {/* Admin: protegido para admins */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="plans" element={<PlansSubscriptionsPage />} />
            <Route path="campaigns" element={<ActiveCampaignsPage />} />
            <Route path="social" element={<SocialConnectionsPage />} />
            <Route path="logs" element={<LogsActivityPage />} />
            <Route path="settings" element={<GeneralSettingsPage />} />
          </Route>
        </Route>

        {/* User: protegido para cualquier autenticado */}
        <Route element={<RequireAuth />}>
          <Route path="/user" element={<UserLayout />}>
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
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;