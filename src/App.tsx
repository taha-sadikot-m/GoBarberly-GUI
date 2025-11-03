import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AuthGuard from './components/auth/AuthGuard';
import RoleBasedRedirect from './components/auth/RoleBasedRedirect';
import ErrorBoundary from './components/common/ErrorBoundary';
import { Login, ForgotPassword, ResetPassword, VerifyOTP, VerifyEmail } from './pages';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuthDebug from './pages/AuthDebug';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { UserRole } from './types/user';
import './index.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppProvider>
            <Router>
            <Routes>
              {/* Test route - for debugging */}
              <Route path="/test" element={
                <div style={{padding: '2rem', textAlign: 'center'}}>
                  <h1>🧪 Test Route</h1>
                  <p>If you can see this, routing is working!</p>
                  <div style={{margin: '1rem 0'}}>
                    <Link to="/login" style={{marginRight: '1rem', textDecoration: 'none', color: '#3b82f6'}}>← Back to Login</Link>
                    <Link to="/super-admin" style={{textDecoration: 'none', color: '#3b82f6'}}>Super Admin Dashboard →</Link>
                  </div>
                </div>
              } />
              
              {/* Auth debug route */}
              <Route path="/auth-debug" element={<AuthDebug />} />
              
              {/* Authentication routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              
              {/* Role-based dashboard routes */}
              <Route 
                path="/super-admin" 
                element={
                  <AuthGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
                    <SuperAdminDashboard />
                  </AuthGuard>
                } 
              />
              
              <Route 
                path="/admin" 
                element={
                  <AuthGuard allowedRoles={[UserRole.ADMIN]}>
                    <AdminDashboard />
                  </AuthGuard>
                } 
              />
              
              {/* Barbershop routes */}
              <Route 
                path="/dashboard" 
                element={
                  <AuthGuard allowedRoles={[UserRole.BARBERSHOP]}>
                    <AppLayout />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/appointments" 
                element={
                  <AuthGuard allowedRoles={[UserRole.BARBERSHOP]}>
                    <AppLayout />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/sales" 
                element={
                  <AuthGuard allowedRoles={[UserRole.BARBERSHOP]}>
                    <AppLayout />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/staff" 
                element={
                  <AuthGuard allowedRoles={[UserRole.BARBERSHOP]}>
                    <AppLayout />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/inventory" 
                element={
                  <AuthGuard allowedRoles={[UserRole.BARBERSHOP]}>
                    <AppLayout />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/customers" 
                element={
                  <AuthGuard allowedRoles={[UserRole.BARBERSHOP]}>
                    <AppLayout />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <AuthGuard allowedRoles={[UserRole.BARBERSHOP]}>
                    <AppLayout />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <AuthGuard allowedRoles={[UserRole.BARBERSHOP]}>
                    <AppLayout />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/services" 
                element={
                  <AuthGuard allowedRoles={[UserRole.BARBERSHOP]}>
                    <AppLayout />
                  </AuthGuard>
                } 
              />
              
              <Route 
                path="/" 
                element={
                  <AuthGuard>
                    <RoleBasedRedirect />
                  </AuthGuard>
                } 
              />
            </Routes>
          </Router>
        </AppProvider>
      </ToastProvider>
    </AuthProvider>
  </ErrorBoundary>
  );
};

export default App;
