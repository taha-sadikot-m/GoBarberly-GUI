import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import styles from './Auth.module.css';
import { 
  validateResetPasswordForm, 
  getFieldErrors, 
  hasFieldError,
  LOADING_MESSAGES,
  VALIDATION_RULES
} from '../utils';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null);

  // Extract token from URL parameters
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const validation = validateResetPasswordForm(formData.password, formData.confirmPassword);
    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation errors when user starts typing
    if (hasFieldError(validationErrors, name)) {
      const filteredErrors = validationErrors.filter(err => err.field !== name);
      setValidationErrors(filteredErrors);
    }

    // Clear general error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid reset token. Please request a new password reset.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await resetPassword(token, formData.password, formData.confirmPassword);
      
      if (result.success) {
        // Successful password reset - redirect to login with success message
        navigate('/login', { 
          state: { 
            message: result.message || 'Password reset successfully! Please log in with your new password.' 
          } 
        });
      } else {
        setError(result.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show error if no token is present
  if (!token && !error) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <Card className={styles.card}>
            <div className={styles.error}>
              <span>⚠️</span>
              Invalid or expired reset token. Please request a new password reset.
            </div>
            <Link to="/forgot-password">
              <Button className={styles.submitButton}>
                Request New Reset
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

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
            <Link to="/verify-otp" className={styles.backLink}>
              ← Back to Verification
            </Link>

            <h2>Reset Your Password</h2>
            <p className={styles.subtitle}>
              Enter your new password below
            </p>

            {error && (
              <div className={styles.error}>
                <span>⚠️</span>
                {error}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="password">New Password</label>
              <div className={styles.passwordContainer}>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading || !token}
                  className={styles.passwordInput}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  disabled={isLoading || !token}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {hasFieldError(validationErrors, 'password') && (
                <div className={styles.fieldError}>
                  {getFieldErrors(validationErrors, 'password')[0]}
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className={styles.passwordContainer}>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading || !token}
                  className={styles.passwordInput}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.passwordToggle}
                  disabled={isLoading || !token}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {hasFieldError(validationErrors, 'confirmPassword') && (
                <div className={styles.fieldError}>
                  {getFieldErrors(validationErrors, 'confirmPassword')[0]}
                </div>
              )}
              
              {formData.confirmPassword && formData.password && (
                <div className={styles.passwordMatch}>
                  {formData.password === formData.confirmPassword ? (
                    <span className={styles.match}>✓ Passwords match</span>
                  ) : (
                    <span className={styles.noMatch}>✗ Passwords don't match</span>
                  )}
                </div>
              )}
            </div>

            <div className={styles.passwordRequirements}>
              <h4>Password Requirements:</h4>
              <ul>
                <li className={formData.password.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH ? styles.met : ''}>
                  {VALIDATION_RULES.PASSWORD.REQUIREMENTS[0]}
                </li>
                <li className={/(?=.*[a-z])/.test(formData.password) ? styles.met : ''}>
                  {VALIDATION_RULES.PASSWORD.REQUIREMENTS[1]}
                </li>
                <li className={/(?=.*[A-Z])/.test(formData.password) ? styles.met : ''}>
                  {VALIDATION_RULES.PASSWORD.REQUIREMENTS[2]}
                </li>
                <li className={/(?=.*\d)/.test(formData.password) ? styles.met : ''}>
                  {VALIDATION_RULES.PASSWORD.REQUIREMENTS[3]}
                </li>
                <li className={/(?=.*[@$!%*?&])/.test(formData.password) ? styles.met : ''}>
                  {VALIDATION_RULES.PASSWORD.REQUIREMENTS[4]}
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              className={styles.submitButton}
              disabled={
                isLoading || 
                !token ||
                !formData.password || 
                !formData.confirmPassword ||
                validationErrors.length > 0
              }
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  {LOADING_MESSAGES.RESETTING_PASSWORD}
                </>
              ) : (
                'Reset Password'
              )}
            </Button>

            <div className={styles.authFooter}>
              <p>
                Remember your password?{' '}
                <Link to="/login" className={styles.link}>
                  Back to Login
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;