import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import UserManagementPage from '@/pages/admin/UserManagementPage';
import PlansSubscriptionsPage from '@/pages/admin/PlansSubscriptionsPage';
import ActiveCampaignsPage from '@/pages/admin/ActiveCampaignsPage';
import SocialConnectionsPage from '@/pages/admin/SocialConnectionsPage';
import LogsActivityPage from '@/pages/admin/LogsActivityPage';
import GeneralSettingsPage from '@/pages/admin/GeneralSettingsPage';

import UserLayout from '@/layouts/UserLayout';
import UserDashboardPage from '@/pages/user/UserDashboardPage';
import UserCampaignsPage from '@/pages/user/UserCampaignsPage';
import UserPostsMentionsPage from '@/pages/user/UserPostsMentionsPage';
import UserAnalyticsPage from '@/pages/user/UserAnalyticsPage';
import UserConnectAccountsPage from '@/pages/user/UserConnectAccountsPage';
import UserPlansPage from '@/pages/user/UserPlansPage';
import UserProfileComparisonPage from '@/pages/user/UserProfileComparisonPage';


import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        {/* Admin Routes */}
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

        {/* User Routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboardPage />} />
          <Route path="campaigns" element={<UserCampaignsPage />} />
          <Route path="posts" element={<UserPostsMentionsPage />} />
          <Route path="analytics" element={<UserAnalyticsPage />} />
          <Route path="connect" element={<UserConnectAccountsPage />} />
          <Route path="plans" element={<UserPlansPage />} />
          <Route path="compare" element={<UserProfileComparisonPage />} />
        </Route>

        {/* Default Redirect (can be login page or user dashboard if logged in) */}
        <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;