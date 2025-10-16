import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import styles from './Auth.module.css';
import type { ResetPasswordRequest } from '../types/auth';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ResetPasswordRequest>({
    token: 'demo-token-123', // Pre-filled for demo
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, always succeed
      // In real app, this would make API call to reset password endpoint
      
      // Successful password reset - redirect to login with success message
      navigate('/login', { 
        state: { 
          message: 'Password reset successfully! Please log in with your new password.' 
        } 
      });
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;

    if (strength < 2) return { label: 'Weak', class: styles.weak };
    if (strength < 4) return { label: 'Medium', class: styles.medium };
    return { label: 'Strong', class: styles.strong };
  };

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

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
              <div className={styles.passwordContainer}>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="New Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className={styles.passwordInput}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  disabled={isLoading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              
              {formData.password && passwordStrength && (
                <div className={styles.passwordStrength}>
                  <div className={`${styles.strengthBar} ${passwordStrength.class}`}>
                    <div className={styles.strengthFill}></div>
                  </div>
                  <span className={styles.strengthLabel}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.passwordContainer}>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className={styles.passwordInput}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.passwordToggle}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              
              {formData.confirmPassword && (
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
                <li className={formData.password.length >= 8 ? styles.met : ''}>
                  At least 8 characters
                </li>
                <li className={/(?=.*[a-z])/.test(formData.password) ? styles.met : ''}>
                  One lowercase letter
                </li>
                <li className={/(?=.*[A-Z])/.test(formData.password) ? styles.met : ''}>
                  One uppercase letter
                </li>
                <li className={/(?=.*\d)/.test(formData.password) ? styles.met : ''}>
                  One number
                </li>
                <li className={/(?=.*[@$!%*?&])/.test(formData.password) ? styles.met : ''}>
                  One special character (@$!%*?&)
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              className={styles.submitButton}
              disabled={
                isLoading || 
                !formData.password || 
                !formData.confirmPassword ||
                formData.password !== formData.confirmPassword ||
                validatePassword(formData.password) !== null
              }
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  Resetting Password...
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