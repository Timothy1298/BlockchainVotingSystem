import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary, NetworkStatus, OfflineMode, ProtectedRoute } from "./components/common";
import { ElectionManage } from "./components/features/elections";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/Dashboard";
import { Elections } from "./pages/elections";
import { Candidates } from "./pages/candidates";
import Results from "./pages/Results";
import { Voters } from "./pages/voters";
import Profile from "./pages/Profile";
import { SystemLogs } from "./pages/system";
import { BlockchainHealth } from "./pages/blockchain";
import { SystemMonitoring } from "./pages/system";
import { AdminSettings } from "./pages/admin";
import UserDetails from "./pages/UserDetails";
import Notifications from "./pages/Notifications";
import { Analytics } from "./pages/analytics";
import { ElectionDetails } from "./pages/elections";

// Voter-specific imports
import VoterLogin from "./pages/voters/VoterLogin";
import VoterRegister from "./pages/voters/VoterRegister";
import VoterRegistrationIntegrated from "./pages/voters/VoterRegistrationIntegrated";
import VoterRegistrationStatus from "./pages/voters/VoterRegistrationStatus";
import VoterDashboard from "./pages/voters/VoterDashboard";
import VoterBallot from "./pages/voters/VoterBallot";
import VoterVerifiability from "./pages/voters/VoterVerifiability";
import VoterProfile from "./pages/voters/VoterProfile";
import VoterKycComplete from './pages/voters/VoterKycComplete';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <OfflineMode />
        <NetworkStatus />
        <Routes>
          {/* Default redirect to unified login */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Unified Login Routes */}
          <Route path="/login" element={<VoterLogin />} />
          <Route path="/register" element={<VoterRegister />} />
          <Route path="/voter/forgot-password" element={<ForgotPassword />} />
          
          {/* Voter Routes */}
          <Route path="/voter/login" element={<Navigate to="/login" />} />
          <Route path="/voter/register" element={<Navigate to="/register" />} />
          <Route path="/voter/registration-integrated" element={<VoterRegistrationIntegrated />} />
          <Route path="/voter/registration" element={<Navigate to="/voter/registration-integrated" />} />
          <Route path="/voter/registration-basic" element={<Navigate to="/voter/registration-integrated" />} />
          <Route path="/voter/registration-status" element={<VoterRegistrationStatus />} />
          <Route path="/voter/dashboard" element={<ProtectedRoute roles={["voter"]}><VoterDashboard /></ProtectedRoute>} />
          <Route path="/voter/ballot" element={<ProtectedRoute roles={["voter"]}><VoterBallot /></ProtectedRoute>} />
          <Route path="/voter/verifiability" element={<ProtectedRoute roles={["voter"]}><VoterVerifiability /></ProtectedRoute>} />
          <Route path="/voter/profile" element={<ProtectedRoute roles={["voter"]}><VoterProfile /></ProtectedRoute>} />
          <Route path="/voter/kyc" element={<ProtectedRoute roles={["voter"]}><VoterKycComplete /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<Navigate to="/login" />} />
          <Route path="/admin/register" element={<Navigate to="/register" />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/elections" element={<ProtectedRoute roles={["admin"]}><Elections /></ProtectedRoute>} />
          <Route path="/admin/candidates" element={<ProtectedRoute roles={["admin"]}><Candidates /></ProtectedRoute>} />
          <Route path="/admin/results" element={<ProtectedRoute roles={["admin"]}><Results /></ProtectedRoute>} />
          <Route path="/admin/voters" element={<ProtectedRoute roles={["admin"]}><Voters /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute roles={["admin"]}><Profile /></ProtectedRoute>} />
          <Route path="/admin/system-logs" element={<ProtectedRoute roles={["admin"]}><SystemLogs /></ProtectedRoute>} />
          <Route path="/admin/blockchain-health" element={<ProtectedRoute roles={["admin"]}><BlockchainHealth /></ProtectedRoute>} />
          <Route path="/admin/system-monitoring" element={<ProtectedRoute roles={["admin"]}><SystemMonitoring /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute roles={["admin"]}><Analytics /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute roles={["admin"]}><Notifications /></ProtectedRoute>} />
          <Route path="/admin/user-details" element={<ProtectedRoute roles={["admin"]}><UserDetails /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute roles={["admin"]}><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/elections/:id" element={<ProtectedRoute roles={["admin"]}><ElectionDetails /></ProtectedRoute>} />
          <Route path="/admin/elections/:id/manage" element={<ProtectedRoute roles={["admin"]}><ElectionManage /></ProtectedRoute>} />
          
          {/* Legacy routes for backward compatibility - now redirect to unified login */}
          <Route path="/legacy/login" element={<Navigate to="/login" />} />
          <Route path="/legacy/register" element={<Navigate to="/register" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Navigate to="/voter/dashboard" />} />
          <Route path="/elections" element={<Navigate to="/voter/dashboard" />} />
          <Route path="/candidates" element={<Navigate to="/voter/dashboard" />} />
          <Route path="/results" element={<Navigate to="/voter/dashboard" />} />
          <Route path="/voters" element={<Navigate to="/admin/voters" />} />
          <Route path="/profile" element={<Navigate to="/voter/profile" />} />
          <Route path="/system-logs" element={<Navigate to="/admin/system-logs" />} />
          <Route path="/blockchain-health" element={<Navigate to="/admin/blockchain-health" />} />
          <Route path="/system-monitoring" element={<Navigate to="/admin/system-monitoring" />} />
          <Route path="/analytics" element={<Navigate to="/admin/analytics" />} />
          <Route path="/notifications" element={<Navigate to="/admin/notifications" />} />
          <Route path="/user-details" element={<Navigate to="/admin/user-details" />} />
          <Route path="/admin-settings" element={<Navigate to="/admin/settings" />} />
          <Route path="/elections/:id" element={<Navigate to="/admin/elections/:id" />} />
          <Route path="/elections/:id/manage" element={<Navigate to="/admin/elections/:id/manage" />} />
        </Routes>
        </Router>
    </ErrorBoundary>
  );
}

export default App;
