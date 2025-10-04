import AdminSettings from "./pages/AdminSettings";
import UserDetails from "./pages/UserDetails";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
// client/src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoutes";  
import Dashboard from "./pages/Dashboard";
import Elections from "./pages/Elections";
import Candidates from "./pages/Candidates";
import Results from "./pages/Results";
import Voters from "./pages/Voters";
import Profile from "./pages/Profile";
import SystemLogs from "./pages/SystemLogs";
import BlockchainHealth from "./pages/BlockchainHealth";

function App() {
  return (
    <Router>
      <Routes>
  {/* Auth Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
  {/* App Routes */}
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/elections" element={<ProtectedRoute><Elections /></ProtectedRoute>} />
  <Route path="/candidates" element={<ProtectedRoute><Candidates /></ProtectedRoute>} />
  <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
  <Route path="/voters" element={<ProtectedRoute roles={["admin"]}><Voters /></ProtectedRoute>} />
  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
  <Route path="/system-logs" element={<ProtectedRoute roles={["admin"]}><SystemLogs /></ProtectedRoute>} />
  <Route path="/blockchain-health" element={<ProtectedRoute roles={["admin"]}><BlockchainHealth /></ProtectedRoute>} />
  <Route path="/analytics" element={<ProtectedRoute roles={["admin"]}><Analytics /></ProtectedRoute>} />
  <Route path="/notifications" element={<ProtectedRoute roles={["admin"]}><Notifications /></ProtectedRoute>} />
  <Route path="/user-details" element={<ProtectedRoute roles={["admin"]}><UserDetails /></ProtectedRoute>} />
  <Route path="/admin-settings" element={<ProtectedRoute roles={["admin"]}><AdminSettings /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
