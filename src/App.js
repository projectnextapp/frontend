import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import "./styles/global.css";
import Export from "./pages/export/Export";

import Support from "./pages/introscreens/Support";
import Privacy from "./pages/introscreens/Privacy";
import Terms from "./pages/introscreens/Terms";
import Pricing from "./pages/introscreens/Pricing";

// Layout
import AppLayout from "./components/layout/AppLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import MemberLogin from "./pages/auth/MemberLogin";

// App Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Members from "./pages/members/Members";
import MemberDetail from "./pages/members/MemberDetail";
import AddMember from "./pages/members/AddMember";
import Elections from "./pages/elections/Elections";
import ElectionDetail from "./pages/elections/ElectionDetail";
import CreateElection from "./pages/elections/CreateElection";
import Finance from "./pages/finance/Finance";
import Expenditure from "./pages/expenditure/Expenditure";
import Notices from "./pages/notices/Notices";
import Notifications from "./pages/notifications/Notifications";
import Profile from "./pages/profile/Profile";

import SuperAdminLogin from "./pages/superadmin/SuperAdminLogin";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import GroupManagement from "./pages/superadmin/GroupManagement";
import GroupDetail from "./pages/superadmin/GroupDetail";

import AdvertManagement from "./pages/superadmin/AdvertManagement";
import LandingPage from "./pages/landing/LandingPage";

import MemberRegister from './pages/auth/MemberRegister';
import PendingMembers from './pages/members/PendingMembers';

// Route guard
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
      <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
      <Route path="/superadmin/groups" element={<GroupManagement />} />
      <Route path="/superadmin/groups/:id" element={<GroupDetail />} />

      <Route path="/superadmin/adverts" element={<AdvertManagement />} />

      {/* Landing Page - NEW DEFAULT ROUTE */}
      <Route path="/" element={<LandingPage />} />

      {/* Public */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/member-login"
        element={
          <PublicRoute>
            <MemberLogin />
          </PublicRoute>
        }
      />
         {/* ADD THIS NEW ROUTE - Member Self-Registration (Public) */}
      <Route path="/member-register" element={<MemberRegister />} />
      <Route path="/pending-members" element={<PendingMembers />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/support" element={<Support />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Protected */}
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/add" element={<AddMember />} />
        <Route path="/members/:id" element={<MemberDetail />} />
        <Route path="/elections" element={<Elections />} />
        <Route path="/elections/create" element={<CreateElection />} />
        <Route path="/elections/:id" element={<ElectionDetail />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/expenditures" element={<Expenditure />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/export" element={<Export />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                borderRadius: "10px",
                background: "#0f172a",
                color: "#f1f5f9",
              },
              success: { iconTheme: { primary: "#00c896", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
