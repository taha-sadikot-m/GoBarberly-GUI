// App Configuration Constants
export const APP_CONFIG = {
  NAME: 'GoBarberly',
  VERSION: '1.0.0',
  DESCRIPTION: 'Barbershop Management System',
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Authentication Configuration
export const AUTH_CONFIG = {
  TOKEN_PREFIX: 'gobarberly',
  ACCESS_TOKEN_KEY: 'gobarberly_access_token',
  REFRESH_TOKEN_KEY: 'gobarberly_refresh_token',
  TOKEN_EXPIRY_KEY: 'gobarberly_token_expiry',
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_OTP: '/verify-otp',
  VERIFY_EMAIL: '/verify-email',
  
  // Dashboards
  SUPER_ADMIN_DASHBOARD: '/super-admin',
  ADMIN_DASHBOARD: '/admin',
  BARBERSHOP_DASHBOARD: '/dashboard',
  
  // Main sections
  APPOINTMENTS: '/appointments',
  CUSTOMERS: '/customers',
  STAFF: '/staff',
  INVENTORY: '/inventory',
  SALES: '/sales',
  REPORTS: '/reports',
  HISTORY: '/history',
} as const;

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  BARBERSHOP: 'barbershop',
  BARBER: 'barber',
  CUSTOMER: 'customer',
} as const;

// Role Permissions
export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    'manage_all',
    'view_all',
    'create_admin',
    'manage_barbershops',
    'view_analytics',
  ],
  [USER_ROLES.ADMIN]: [
    'manage_barbershops',
    'view_barbershops',
    'manage_users',
    'view_reports',
  ],
  [USER_ROLES.BARBERSHOP]: [
    'manage_shop',
    'manage_staff',
    'manage_appointments',
    'manage_customers',
    'manage_inventory',
    'view_shop_reports',
  ],
  [USER_ROLES.BARBER]: [
    'view_appointments',
    'manage_own_appointments',
    'view_customers',
  ],
  [USER_ROLES.CUSTOMER]: [
    'book_appointments',
    'view_own_appointments',
    'manage_profile',
  ],
} as const;

// Role-based routing
export const ROLE_ROUTES = {
  [USER_ROLES.SUPER_ADMIN]: ROUTES.SUPER_ADMIN_DASHBOARD,
  [USER_ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
  [USER_ROLES.BARBERSHOP]: ROUTES.BARBERSHOP_DASHBOARD,
  [USER_ROLES.BARBER]: ROUTES.BARBERSHOP_DASHBOARD,
  [USER_ROLES.CUSTOMER]: ROUTES.BARBERSHOP_DASHBOARD,
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 254,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    REQUIREMENTS: [
      'At least 8 characters',
      'One lowercase letter',
      'One uppercase letter',  
      'One number',
      'One special character (@$!%*?&)',
    ],
  },
  PHONE: {
    PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]+$/,
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  LOGIN_FAILED: 'Invalid email or password.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  REGISTRATION_SUCCESS: 'Registration successful! Please check your email for verification.',
  PASSWORD_RESET_REQUEST: 'Password reset instructions have been sent to your email.',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully!',
  EMAIL_VERIFIED: 'Email verified successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
} as const;

// Loading States
export const LOADING_MESSAGES = {
  LOGGING_IN: 'Signing you in...',
  REGISTERING: 'Creating your account...',
  SENDING_EMAIL: 'Sending verification email...',
  VERIFYING_EMAIL: 'Verifying your email...',
  RESETTING_PASSWORD: 'Resetting your password...',
  LOADING: 'Loading...',
  SAVING: 'Saving...',
  UPDATING: 'Updating...',
  DELETING: 'Deleting...',
} as const;