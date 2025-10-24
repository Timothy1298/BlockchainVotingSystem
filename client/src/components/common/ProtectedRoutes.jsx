import React, { useContext } from "react";
import { AuthContext } from '../../contexts/auth';
import { Navigate } from "react-router-dom";

// ProtectedRoute now supports an optional `roles` prop, an array of allowed roles.
// Usage: <ProtectedRoute roles={["admin"]}><AdminPage/></ProtectedRoute>
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, token, loading } = useContext(AuthContext);

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Only redirect to login if we're sure there's no token
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If we have a token but no user yet, wait a bit more
  if (token && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (roles && roles.length > 0) {
    const role = (user?.role || '').toLowerCase();
    const allowed = roles.map((r) => r.toString().toLowerCase());
    if (!allowed.includes(role)) {
      // Redirect to the correct dashboard based on role
      const target = role === 'admin' ? '/admin/dashboard' : '/voter/dashboard';
      return <Navigate to={target} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
