// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from '@/layouts/AdminLayout';
import UserLayout from '@/layouts/UserLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Admin Pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import UserManagementPage from '@/pages/admin/UserManagementPage';
import PlansSubscriptionsPage from '@/pages/admin/PlansSubscriptionsPage';
import ActiveCampaignsPage from '@/pages/admin/ActiveCampaignsPage';
import SocialConnectionsPage from '@/pages/admin/SocialConnectionsPage';
import LogsActivityPage from '@/pages/admin/LogsActivityPage';
import GeneralSettingsPage from '@/pages/admin/GeneralSettingsPage';

// User Pages
import UserDashboardPage from '@/pages/user/UserDashboardPage';
import UserCampaignsPage from '@/pages/user/UserCampaignsPage';
import CampaignFormPage from '@/pages/user/CampaignFormPage';
import UserPostsMentionsPage from '@/pages/user/UserPostsMentionsPage';
import UserAnalyticsPage from '@/pages/user/UserAnalyticsPage';
import UserConnectAccountsPage from '@/pages/user/UserConnectAccountsPage';
import UserPlansPage from '@/pages/user/UserPlansPage';
import UserProfileComparisonPage from '@/pages/user/UserProfileComparisonPage';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

import { Toaster } from '@/components/ui/toaster';

function App() {
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Efecto: al cargar la app, revisa si hay token guardado
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <Toaster />
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="register" element={<RegisterPage />} />
          <Route index element={<Navigate to="login" replace />} />
        </Route>

        {/* Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            isAuthenticated ? <AdminLayout /> : <Navigate to="/auth/login" replace />
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

        {/* User Routes */}
        <Route 
          path="/user/*" 
          element={
            isAuthenticated ? <UserLayout /> : <Navigate to="/auth/login" replace />
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

        {/* Default Redirect */}
        <Route 
          path="*" 
          element={
            isAuthenticated 
              ? <Navigate to="/user/dashboard" replace /> 
              : <Navigate to="/auth/login" replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;