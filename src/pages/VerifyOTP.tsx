import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import styles from './Auth.module.css';
import type { VerifyOTPRequest } from '../types/auth';

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || 'admin@gobarberly.com';
  
  const [formData, setFormData] = useState<VerifyOTPRequest>({
    email: emailFromState,
    otp: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend functionality
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      otp: newOtp.join('')
    }));

    // Clear error when user starts typing
    if (error) setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const otpString = otp.join('');

    // Basic validation
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, accept '123456' as valid OTP
      if (otpString === '123456') {
        // Successful verification - redirect to reset password
        navigate('/reset-password');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset timer
      setResendTimer(30);
      setCanResend(false);
      
      // Clear current OTP
      setOtp(['', '', '', '', '', '']);
      setFormData(prev => ({ ...prev, otp: '' }));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
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
            <Link to="/forgot-password" className={styles.backLink}>
              ← Back to Forgot Password
            </Link>

            <h2>Verify Your Email</h2>
            <p className={styles.subtitle}>
              Enter the 6-digit code sent to <strong>{formData.email}</strong>
            </p>

            {error && (
              <div className={styles.error}>
                <span>⚠️</span>
                {error}
              </div>
            )}

            <div className={styles.otpContainer}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(ref: HTMLInputElement | null) => { inputRefs.current[index] = ref; }}
                  type="text"
                  value={digit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                  className={`${styles.otpInput} ${digit ? styles.filled : ''}`}
                  disabled={isLoading}
                  maxLength={1}
                  inputMode="numeric"
                  pattern="[0-9]"
                />
              ))}
            </div>

            <Button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || otp.join('').length !== 6}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            <div className={styles.resendContainer}>
              <p className={styles.resendText}>
                Didn't receive the code?
              </p>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  className={styles.resendButton}
                  disabled={isLoading}
                >
                  Resend Code
                </button>
              ) : (
                <span className={styles.timer}>
                  Resend in {resendTimer}s
                </span>
              )}
            </div>

            <div className={styles.demo}>
              <p>Demo Code:</p>
              <code>123456</code>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOTP;