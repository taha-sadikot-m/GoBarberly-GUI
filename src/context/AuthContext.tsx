import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { AuthUser, AuthState, LoginCredentials } from '../types/auth';
import { AuthService, TokenManager, setupTokenRefresh } from '../services/api';
import { 
  getErrorMessage, 
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES,
  ROLE_ROUTES,
  USER_ROLES
} from '../utils';

interface AuthContextValue {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: AuthUser; message?: string; redirectTo?: string }>;
  logout: () => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: string;
    shop_name?: string;
    shop_owner_name?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  updateUser: (user: Partial<AuthUser>) => Promise<{ success: boolean; user?: AuthUser; message?: string }>;
  refreshAuth: () => Promise<boolean>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; message?: string }>;
  isAuthenticated: boolean;
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // 🔧 FIXED: Using real authentication instead of test user
      // Check if user has valid tokens
      if (AuthService.isAuthenticated()) {
        try {
          // Try to get user profile from backend
          const response = await AuthService.getProfile();
          
          if (response.success && response.data) {
            setState({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            // Setup automatic token refresh
            setupTokenRefresh();
            return;
          }
        } catch (error) {
          console.error('Failed to get user profile:', error);
          // Clear invalid tokens
          TokenManager.clearTokens();
        }
      }
      
      // No valid authentication
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: getErrorMessage(error),
      });
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Login function
  const login = async (credentials: LoginCredentials): Promise<{ 
    success: boolean; 
    user?: AuthUser; 
    message?: string; 
    redirectTo?: string;
  }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await AuthService.login(credentials);
      
      if (response.success && response.data) {
        const user = response.data.user;
        
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Setup automatic token refresh
        setupTokenRefresh();

        // Determine redirect route based on user role
        const redirectTo = ROLE_ROUTES[user.role as keyof typeof ROLE_ROUTES] || '/dashboard';

        return { 
          success: true, 
          user, 
          message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
          redirectTo
        };
      } else {
        const errorMessage = response.message || ERROR_MESSAGES.LOGIN_FAILED;
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: errorMessage 
        }));
        
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      
      return { success: false, message: errorMessage };
    }
  };

  // Registration function
  const register = async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: string;
    shop_name?: string;
    shop_owner_name?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await AuthService.register(userData);
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      if (response.success) {
        return { 
          success: true, 
          message: response.message || SUCCESS_MESSAGES.REGISTRATION_SUCCESS 
        };
      } else {
        const errorMessage = response.message || 'Registration failed';
        setState(prev => ({ ...prev, error: errorMessage }));
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      
      return { success: false, message: errorMessage };
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  // Update user profile
  const updateUser = async (userData: Partial<AuthUser>): Promise<{ 
    success: boolean; 
    user?: AuthUser; 
    message?: string;
  }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await AuthService.updateProfile(userData);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          user: response.data!,
          isLoading: false,
        }));
        
        return { 
          success: true, 
          user: response.data, 
          message: response.message || SUCCESS_MESSAGES.PROFILE_UPDATED 
        };
      } else {
        const errorMessage = response.message || 'Profile update failed';
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: errorMessage 
        }));
        
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      
      return { success: false, message: errorMessage };
    }
  };

  // Refresh authentication
  const refreshAuth = async (): Promise<boolean> => {
    try {
      const success = await AuthService.refreshToken();
      if (!success) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
      return success;
    } catch (error) {
      console.error('Token refresh error:', error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return false;
    }
  };

  // Forgot password
  const forgotPassword = async (email: string): Promise<{ 
    success: boolean; 
    message?: string;
  }> => {
    try {
      const response = await AuthService.forgotPassword({ email });
      return { 
        success: response.success, 
        message: response.message || SUCCESS_MESSAGES.PASSWORD_RESET_REQUEST
      };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error) 
      };
    }
  };

  // Reset password
  const resetPassword = async (
    token: string, 
    password: string, 
    confirmPassword: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await AuthService.resetPassword({ 
        token, 
        password, 
        confirmPassword 
      });
      
      return { 
        success: response.success, 
        message: response.message || SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS
      };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error) 
      };
    }
  };

  // Verify email
  const verifyEmail = async (token: string): Promise<{ 
    success: boolean; 
    message?: string;
  }> => {
    try {
      const response = await AuthService.verifyEmail(token);
      return { 
        success: response.success, 
        message: response.message || SUCCESS_MESSAGES.EMAIL_VERIFIED
      };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error) 
      };
    }
  };

  // Resend verification email
  const resendVerification = async (email: string): Promise<{ 
    success: boolean; 
    message?: string;
  }> => {
    try {
      const response = await AuthService.resendVerification(email);
      return { 
        success: response.success, 
        message: response.message || 'Verification email sent successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error) 
      };
    }
  };

  // Change password
  const changePassword = async (
    currentPassword: string, 
    newPassword: string, 
    confirmPassword: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await AuthService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });
      
      return { 
        success: response.success, 
        message: response.message || SUCCESS_MESSAGES.PASSWORD_CHANGED
      };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error) 
      };
    }
  };

  // Helper functions
  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!state.user) return false;
    
    const userRole = state.user.role;
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  }, [state.user]);

  const hasPermission = useCallback((_permission: string): boolean => {
    if (!state.user) return false;
    
    // Super admin has all permissions
    if (state.user.role === USER_ROLES.SUPER_ADMIN) return true;
    
    // Add more permission logic as needed
    return true; // Simplified for now
  }, [state.user]);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const contextValue: AuthContextValue = useMemo(() => ({
    state,
    login,
    logout,
    register,
    updateUser,
    refreshAuth,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    changePassword,
    isAuthenticated: state.isAuthenticated,
    hasRole,
    hasPermission,
    clearError,
  }), [
    state,
    login,
    logout,
    register,
    updateUser,
    refreshAuth,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    changePassword,
    hasRole,
    hasPermission,
    clearError,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};