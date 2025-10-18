import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AuthState, AuthUser, LoginCredentials } from '../types/auth';
import { UserRole } from '../types/user';

// Demo users for different roles
const DEMO_USERS = {
  'superadmin@gobarberly.com': {
    id: '1',
    email: 'superadmin@gobarberly.com',
    name: 'Super Admin',
    role: UserRole.SUPER_ADMIN,
  },
  'admin@gobarberly.com': {
    id: '2', 
    email: 'admin@gobarberly.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
  },
  'barbershop@gobarberly.com': {
    id: '3',
    email: 'barbershop@gobarberly.com', 
    name: 'Barbershop Owner',
    role: UserRole.BARBERSHOP,
    shopName: 'Elite Cuts',
    shopOwnerName: 'John Smith'
  }
};

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthUser }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData.user && authData.expiresAt && new Date(authData.expiresAt) > new Date()) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: authData.user });
        } else {
          localStorage.removeItem('auth');
        }
      } catch (error) {
        localStorage.removeItem('auth');
      }
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check demo credentials
      const demoUser = DEMO_USERS[credentials.email as keyof typeof DEMO_USERS];
      const isValidPassword = credentials.password === 'admin123'; // Demo password for all users

      if (demoUser && isValidPassword) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

        // Store auth data
        const authData = {
          user: demoUser,
          token: 'demo-token-' + Date.now(),
          expiresAt: expiresAt.toISOString(),
        };

        localStorage.setItem('auth', JSON.stringify(authData));
        dispatch({ type: 'LOGIN_SUCCESS', payload: demoUser });
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = (): void => {
    console.log('Logout function called'); // Debug log
    localStorage.removeItem('auth');
    dispatch({ type: 'LOGOUT' });
    console.log('Logout dispatched, localStorage cleared'); // Debug log
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;