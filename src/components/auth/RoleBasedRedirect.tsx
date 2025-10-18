import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../auth/AuthGuard';

const RoleBasedRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const dashboardPath = getDashboardPath(user.role);
  return <Navigate to={dashboardPath} replace />;
};

export default RoleBasedRedirect;