import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import styles from './Auth.module.css';
import { SUCCESS_MESSAGES } from '../utils';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const verifyEmailToken = async () => {
      const token = searchParams.get('token');
      const userEmail = searchParams.get('email') || 'your email';
      
      setEmail(userEmail);
      
      if (!token) {
        setError('Invalid verification link. Please check your email or request a new verification.');
        setIsLoading(false);
        return;
      }

      try {
        const result = await verifyEmail(token);
        
        if (result.success) {
          setIsSuccess(true);
          
          // Auto redirect to login after successful verification
          setTimeout(() => {
            navigate('/login', {
              state: {
                message: result.message || SUCCESS_MESSAGES.EMAIL_VERIFIED
              }
            });
          }, 3000);
        } else {
          setError(result.message || 'Email verification failed. The link may be expired or invalid.');
        }
      } catch (err) {
        setError('Email verification failed. Please try again or request a new verification.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmailToken();
  }, [searchParams, verifyEmail, navigate]);

  if (isLoading) {
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
              <h2>Verifying Your Email</h2>
              <div className={styles.loading}>
                <span className={styles.spinner}></span>
                <p>Please wait while we verify your email address...</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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
              <h2>Email Verified Successfully! 🎉</h2>
              <p className={styles.subtitle}>
                Your email address <strong>{email}</strong> has been verified successfully.
              </p>

              <div className={styles.success}>
                <span>✅</span>
                Welcome to GoBarberly! You can now sign in to your account.
              </div>

              <p style={{ fontSize: '0.875rem', color: '#64748b', textAlign: 'center', marginBottom: '1.5rem' }}>
                You'll be automatically redirected to the login page in a few seconds.
              </p>

              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button className={styles.submitButton}>
                  Continue to Login
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
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
            <h2>Email Verification Failed</h2>
            
            <div className={styles.error}>
              <span>⚠️</span>
              {error}
            </div>

            <p className={styles.subtitle}>
              The verification link may be expired or invalid. You can request a new verification email or try signing in.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button className={styles.submitButton}>
                  Try Signing In
                </Button>
              </Link>
              
              <Link to="/forgot-password" className={styles.link} style={{ textAlign: 'center' }}>
                Request New Verification
              </Link>
            </div>

            <div className={styles.authFooter}>
              <p>
                Need help?{' '}
                <Link to="/login" className={styles.link}>
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;