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
      </Routes>
    </Router>
  );
}

export default App;
