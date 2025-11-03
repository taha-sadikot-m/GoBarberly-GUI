import { ERROR_MESSAGES, VALIDATION_RULES } from './constants';

// API Error Handling Utilities
export interface ApiError extends Error {
  status?: number;
  errors?: any;
}

export const createApiError = (message: string, status?: number, errors?: any): ApiError => {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.errors = errors;
  return error;
};

export const getErrorMessage = (error: any): string => {
  if (!error) return ERROR_MESSAGES.GENERIC_ERROR;
  
  // If it's already a string, return it
  if (typeof error === 'string') return error;
  
  // Handle API errors with response data
  if (error.response?.data) {
    const apiError = error.response.data;
    
    // Check for specific error message
    if (apiError.message) return apiError.message;
    
    // Check for field-specific errors
    if (apiError.errors) {
      // Handle non_field_errors
      if (apiError.errors.non_field_errors) {
        return Array.isArray(apiError.errors.non_field_errors) 
          ? apiError.errors.non_field_errors[0]
          : apiError.errors.non_field_errors;
      }
      
      // Handle other field errors
      const firstError = Object.values(apiError.errors)[0];
      if (Array.isArray(firstError)) {
        return firstError[0];
      }
      if (typeof firstError === 'string') {
        return firstError;
      }
    }
  }
  
  // Handle network errors
  if (error.code === 'NETWORK_ERROR' || !error.response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  // Handle HTTP status codes
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 500:
      case 502:
      case 503:
      case 504:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.GENERIC_ERROR;
    }
  }
  
  // Fallback to error message or generic error
  return error.message || ERROR_MESSAGES.GENERIC_ERROR;
};

// Form Validation Utilities
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const validateEmail = (email: string): ValidationError | null => {
  if (!email) {
    return { field: 'email', message: 'Email is required' };
  }
  
  if (email.length > VALIDATION_RULES.EMAIL.MAX_LENGTH) {
    return { field: 'email', message: 'Email is too long' };
  }
  
  if (!VALIDATION_RULES.EMAIL.PATTERN.test(email)) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }
  
  return null;
};

export const validatePassword = (password: string): ValidationError | null => {
  if (!password) {
    return { field: 'password', message: 'Password is required' };
  }
  
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return { field: 'password', message: `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters long` };
  }
  
  if (!VALIDATION_RULES.PASSWORD.PATTERN.test(password)) {
    return { field: 'password', message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' };
  }
  
  return null;
};

export const validatePasswordConfirmation = (password: string, confirmPassword: string): ValidationError | null => {
  if (!confirmPassword) {
    return { field: 'confirmPassword', message: 'Password confirmation is required' };
  }
  
  if (password !== confirmPassword) {
    return { field: 'confirmPassword', message: 'Passwords do not match' };
  }
  
  return null;
};

export const validateName = (name: string, fieldName = 'name'): ValidationError | null => {
  if (!name) {
    return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required` };
  }
  
  if (name.length < VALIDATION_RULES.NAME.MIN_LENGTH) {
    return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters long` };
  }
  
  if (name.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is too long` };
  }
  
  if (!VALIDATION_RULES.NAME.PATTERN.test(name)) {
    return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} can only contain letters, spaces, apostrophes, and hyphens` };
  }
  
  return null;
};

export const validatePhone = (phone: string): ValidationError | null => {
  if (!phone) {
    return { field: 'phone', message: 'Phone number is required' };
  }
  
  if (!VALIDATION_RULES.PHONE.PATTERN.test(phone)) {
    return { field: 'phone', message: 'Please enter a valid phone number' };
  }
  
  return null;
};

// Comprehensive form validation
export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);
  
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRegistrationForm = (data: {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);
  
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.push(passwordError);
  
  const confirmPasswordError = validatePasswordConfirmation(data.password, data.confirmPassword);
  if (confirmPasswordError) errors.push(confirmPasswordError);
  
  const firstNameError = validateName(data.firstName, 'firstName');
  if (firstNameError) errors.push(firstNameError);
  
  const lastNameError = validateName(data.lastName, 'lastName');
  if (lastNameError) errors.push(lastNameError);
  
  if (data.phone) {
    const phoneError = validatePhone(data.phone);
    if (phoneError) errors.push(phoneError);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateForgotPasswordForm = (email: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateResetPasswordForm = (password: string, confirmPassword: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  const passwordError = validatePassword(password);
  if (passwordError) errors.push(passwordError);
  
  const confirmPasswordError = validatePasswordConfirmation(password, confirmPassword);
  if (confirmPasswordError) errors.push(confirmPasswordError);
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Utility functions
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const formatError = (error: ValidationError): string => {
  return error.message;
};

export const getFieldErrors = (errors: ValidationError[], field: string): string[] => {
  return errors.filter(error => error.field === field).map(error => error.message);
};

export const hasFieldError = (errors: ValidationError[], field: string): boolean => {
  return errors.some(error => error.field === field);
};

// Local Storage utilities
export const storage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};