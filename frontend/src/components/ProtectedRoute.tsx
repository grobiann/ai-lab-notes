import React from 'react';
import { useAuth } from '../hooks/useApi';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * Route guard component for authenticated/admin-only pages
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="auth-required">
        <h2>Login Required</h2>
        <p>Please log in to access this page.</p>
        <a href="/login" className="btn btn-primary">
          Go to Login
        </a>
      </div>
    );
  }

  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="unauthorized">
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
        <a href="/" className="btn btn-primary">
          Go Home
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
