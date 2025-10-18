import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import styles from './Auth.module.css';
import type { LoginCredentials } from '../types/auth';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../components/auth/AuthGuard';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, error: authError, clearError } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // Get success message from navigation state (e.g., from password reset)
  const successMessage = location.state?.message;

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Login page: Auth state changed', { isAuthenticated, user }); // Debug log
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname || getDashboardPath(user.role);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (authError) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      return;
    }

    if (!formData.email.includes('@')) {
      return;
    }

    try {
      await login(formData);
      // Navigation is handled by the useEffect hook
    } catch (err) {
      // Error is handled by the AuthContext
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <Card className={styles.card}>
          <div className={styles.header}>
            <div className={styles.logo}>
              <h1>✂️ GoBarberly</h1>
              <p>Barbershop Management System</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <h2>Welcome Back</h2>
            <p className={styles.subtitle}>Sign in to your account</p>

            {successMessage && (
              <div className={styles.success}>
                <span>✅</span>
                {successMessage}
              </div>
            )}

            {authError && (
              <div className={styles.error}>
                <span>⚠️</span>
                {authError}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={false}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordInput}>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  disabled={false}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={false}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <div className={styles.formActions}>
              <Link to="/forgot-password" className={styles.forgotLink}>
                Forgot your password?
              </Link>
            </div>

            <Button
              type="submit"
              className={styles.submitButton}
              disabled={false || !formData.email || !formData.password}
            >
              Sign In
            </Button>

            <div className={styles.demo}>
              <p>Demo Credentials:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem' }}>
                <code>superadmin@gobarberly.com / admin123</code>
                <code>admin@gobarberly.com / admin123</code>
                <code>barbershop@gobarberly.com / admin123</code>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;