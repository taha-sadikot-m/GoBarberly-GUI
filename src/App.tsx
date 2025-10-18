import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AuthGuard from './components/auth/AuthGuard';
import RoleBasedRedirect from './components/auth/RoleBasedRedirect';
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
    </AuthProvider>
  );
};

export default App;
