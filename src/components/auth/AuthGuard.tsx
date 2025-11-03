import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user';
import { ROUTES, USER_ROLES } from '../../utils';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  allowedRoles, 
  requireAuth = true 
}) => {
  const location = useLocation();
  const { state } = useAuth();

  console.log('🛡️ AuthGuard:', {
    pathname: location.pathname,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    user: state.user ? { role: state.user.role, email: state.user.email } : null,
    allowedRoles,
    requireAuth
  });

  // Show loading while checking auth
  if (state.isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '2rem',
          height: '2rem',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && (!state.isAuthenticated || !state.user)) {
    console.log('AuthGuard: User not authenticated, redirecting to login'); 
    // Redirect to login page with return url
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && state.user && !allowedRoles.includes(state.user.role as UserRole)) {
    console.log('🚫 AuthGuard: Role mismatch, redirecting', {
      userRole: state.user.role,
      allowedRoles,
      redirectingTo: getDashboardPath(state.user.role as UserRole)
    });
    // Redirect to appropriate dashboard based on user role
    const dashboardPath = getDashboardPath(state.user.role as UserRole);
    return <Navigate to={dashboardPath} replace />;
  }

  console.log('✅ AuthGuard: Access granted, rendering children');

  return <>{children}</>;
};

// Helper function to get dashboard path based on user role
export const getDashboardPath = (role: UserRole | string): string => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
    case USER_ROLES.SUPER_ADMIN:
      return ROUTES.SUPER_ADMIN_DASHBOARD;
    case UserRole.ADMIN:
    case USER_ROLES.ADMIN:
      return ROUTES.ADMIN_DASHBOARD;
    case UserRole.BARBERSHOP:
    case USER_ROLES.BARBERSHOP:
    case USER_ROLES.BARBER:
    case USER_ROLES.CUSTOMER:
    default:
      return ROUTES.BARBERSHOP_DASHBOARD;
  }
};

export default AuthGuard;