import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import styles from './Auth.module.css';
import type { ForgotPasswordRequest } from '../types/auth';
import { 
  validateForgotPasswordForm, 
  getFieldErrors, 
  hasFieldError,
  LOADING_MESSAGES
} from '../utils';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  
  const [formData, setFormData] = useState<ForgotPasswordRequest>({
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  const validateForm = (): boolean => {
    const validation = validateForgotPasswordForm(formData.email);
    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await forgotPassword(formData.email);
      
      if (result.success) {
        setIsSuccess(true);
        
        // Auto redirect after showing success message
        setTimeout(() => {
          // Note: Backend uses token-based reset, not OTP
          // Navigate to a page that tells user to check email
          navigate('/login', { 
            state: { 
              message: result.message || 'Password reset instructions sent to your email'
            }
          });
        }, 3000);
      } else {
        setError(result.message || 'Failed to send password reset email');
      }
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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

            <div className={styles.form}>
              <h2>Check Your Email</h2>
              <p className={styles.subtitle}>
                We've sent password reset instructions to <strong>{formData.email}</strong>
              </p>

              <div className={styles.success}>
                <span>✅</span>
                Reset instructions sent successfully!
              </div>

              <p style={{ fontSize: '0.875rem', color: '#64748b', textAlign: 'center', marginBottom: '1.5rem' }}>
                Please check your email for the reset link. If you don't see it, check your spam folder. You'll be redirected to the login page in a few seconds.
              </p>

              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button className={styles.submitButton}>
                  Return to Login
                </Button>
              </Link>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link to="/login" className={styles.backLink}>
                  ← Back to Login
                </Link>
              </div>
            </div>
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
            <Link to="/login" className={styles.backLink}>
              ← Back to Login
            </Link>

            <h2>Forgot Password?</h2>
            <p className={styles.subtitle}>
              No worries! Enter your email and we'll send you a verification code to reset your password.
            </p>

            {error && (
              <div className={styles.error}>
                <span>⚠️</span>
                {error}
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
                placeholder="Enter your email address"
                disabled={isLoading}
                required
              />
              {hasFieldError(validationErrors, 'email') && (
                <div className={styles.fieldError}>
                  {getFieldErrors(validationErrors, 'email')[0]}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || !formData.email}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  {LOADING_MESSAGES.SENDING_EMAIL}
                </>
              ) : (
                'Send Reset Instructions'
              )}
            </Button>

            <div className={styles.demo}>
              <p><strong>Note:</strong> You'll receive an email with password reset instructions</p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;