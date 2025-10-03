import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

// ProtectedRoute now supports an optional `roles` prop, an array of allowed roles.
// Usage: <ProtectedRoute roles={["admin"]}><AdminPage/></ProtectedRoute>
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, token } = useContext(AuthContext);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const role = (user?.role || '').toString().toLowerCase();
    const allowed = roles.map((r) => r.toString().toLowerCase());
    if (!allowed.includes(role)) {
      // If user is authenticated but not authorized, send them to the dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
