import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import styles from './Auth.module.css';
import type { ForgotPasswordRequest } from '../types/auth';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ForgotPasswordRequest>({
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Basic validation
    if (!formData.email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, always succeed
      setIsSuccess(true);
      
      // Auto redirect to OTP verification after showing success message
      setTimeout(() => {
        navigate('/verify-otp', { 
          state: { email: formData.email }
        });
      }, 3000);
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
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
                We've sent a 6-digit verification code to <strong>{formData.email}</strong>
              </p>

              <div className={styles.success}>
                <span>✅</span>
                Verification code sent successfully!
              </div>

              <p style={{ fontSize: '0.875rem', color: '#64748b', textAlign: 'center', marginBottom: '1.5rem' }}>
                If you don't see the email, check your spam folder. You'll be redirected to enter the code in a few seconds.
              </p>

              <Link to="/verify-otp" style={{ textDecoration: 'none' }}>
                <Button className={styles.submitButton}>
                  Continue to Verification
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
                placeholder="Enter your email"
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || !formData.email}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  Sending Code...
                </>
              ) : (
                'Send Verification Code'
              )}
            </Button>

            <div className={styles.demo}>
              <p>Demo: Any valid email will work for testing</p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;