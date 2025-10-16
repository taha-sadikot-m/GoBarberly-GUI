import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AuthGuard from './components/auth/AuthGuard';
import { Login, ForgotPassword, ResetPassword, VerifyOTP } from './pages';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { UserRole } from './types/user';
import './index.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Authentication routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            
            {/* Role-based protected routes */}
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
            
            {/* Barbershop routes (existing functionality) */}
            <Route 
              path="/*" 
              element={
                <AuthGuard allowedRoles={[UserRole.BARBERSHOP]}>
                  <AppLayout />
                </AuthGuard>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
