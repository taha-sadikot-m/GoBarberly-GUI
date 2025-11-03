import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import styles from './Auth.module.css';
import type { LoginCredentials } from '../types/auth';
import { 
  validateLoginForm, 
  getFieldErrors, 
  hasFieldError,
  LOADING_MESSAGES
} from '../utils';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, state: authState, clearError } = useAuth();
  const { showError, showSuccess } = useToast();
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for success message from password reset or email verification
  const successMessage = location.state?.message;

  // Show success message as toast
  useEffect(() => {
    if (successMessage) {
      showSuccess(successMessage, 'Success');
      // Clear the success message from navigation state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [successMessage, navigate, location.pathname, showSuccess]);

  // Show authentication errors as toast
  useEffect(() => {
    if (authState.error) {
      showError(authState.error, 'Login Failed');
    }
  }, [authState.error, showError]);

  // Redirect if already authenticated
  useEffect(() => {
    // Only redirect if user is authenticated and not in loading state
    if (authState.isAuthenticated && authState.user && !authState.isLoading) {
      console.log('🔄 Login: User authenticated, redirecting...', {
        user: authState.user,
        currentLocation: location.pathname,
        isLoading: authState.isLoading
      });
      
      const from = location.state?.from?.pathname;
      // Get role-based dashboard path
      const getDashboardPath = (role: string): string => {
        switch (role) {
          case 'super_admin':
            return '/super-admin';
          case 'admin':
            return '/admin';
          case 'barbershop':
          default:
            return '/dashboard';
        }
      };
      
      const defaultPath = getDashboardPath(authState.user.role);
      const redirectPath = from && from !== '/login' ? from : defaultPath;
      
      console.log('🎯 Login: Navigating to:', redirectPath);
      // Use a slight delay to ensure state is fully updated
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
    }
  }, [authState.isAuthenticated, authState.user, authState.isLoading, navigate, location]);

  // Clear error when component unmounts or when user starts typing
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const validateForm = (): boolean => {
    const validation = validateLoginForm(credentials.email, credentials.password);
    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation errors when user starts typing
    if (hasFieldError(validationErrors, name)) {
      const filteredErrors = validationErrors.filter(error => error.field !== name);
      setValidationErrors(filteredErrors);
    }
    
    // Clear auth error when user starts typing
    if (authState.error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await login(credentials);
      
      if (result.success && result.user) {
        // Navigation is handled by the useEffect hook above
        console.log('Login successful, navigation will be handled by useEffect');
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
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



            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                disabled={authState.isLoading || isSubmitting}
                required
              />
              {hasFieldError(validationErrors, 'email') && (
                <div className={styles.fieldError}>
                  {getFieldErrors(validationErrors, 'email')[0]}
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordInput}>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  disabled={authState.isLoading || isSubmitting}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={authState.isLoading || isSubmitting}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
              {hasFieldError(validationErrors, 'password') && (
                <div className={styles.fieldError}>
                  {getFieldErrors(validationErrors, 'password')[0]}
                </div>
              )}
            </div>

            <div className={styles.formActions}>
              <Link to="/forgot-password" className={styles.forgotLink}>
                Forgot your password?
              </Link>
            </div>

            <Button
              type="submit"
              className={styles.submitButton}
              disabled={authState.isLoading || isSubmitting || !credentials.email || !credentials.password}
            >
              {(authState.isLoading || isSubmitting) ? (
                <>
                  <span className={styles.spinner}></span>
                  {LOADING_MESSAGES.LOGGING_IN}
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Demo section - remove in production */}
            <div className={styles.demo}>
              
              
            </div>

            
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;