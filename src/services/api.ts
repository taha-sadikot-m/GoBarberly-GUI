import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { LoginCredentials, ForgotPasswordRequest, ResetPasswordRequest, AuthUser } from '../types/auth';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const API_PREFIX = '/api';

// Create axios instance with default configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: 90000, // Increased to 90 seconds for slow email services on Render
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'gobarberly_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'gobarberly_refresh_token';
  private static readonly TOKEN_EXPIRY_KEY = 'gobarberly_token_expiry';

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    const expiryTime = Date.now() + (expiresIn * 1000);
    
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  static isTokenExpired(): boolean {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    
    return Date.now() > parseInt(expiry);
  }

  static isTokenExpiringSoon(): boolean {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    
    // Check if token expires in next 5 minutes
    return (parseInt(expiry) - Date.now()) < (5 * 60 * 1000);
  }
}

// Standardized API Response Interface
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config: any) => {
    const token = TokenManager.getAccessToken();
    const isExpired = TokenManager.isTokenExpired();
    
    if (token && !isExpired) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log API calls in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        hasToken: !!token,
        isTokenExpired: isExpired,
        authHeader: config.headers.Authorization ? 'Bearer [TOKEN]' : 'None'
      });
    }
    
    return config;
  },
  (error: any) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common responses and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Log API responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as any;

    // Handle token refresh for 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = TokenManager.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}${API_PREFIX}/auth/token/refresh/`, {
            refresh: refreshToken
          });

          const { access, refresh, expires_in } = response.data;
          TokenManager.setTokens(access, refresh, expires_in);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          TokenManager.clearTokens();
          
          // Redirect to login
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        TokenManager.clearTokens();
        window.location.href = '/login';
      }
    }

    // Log API errors in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }

    return Promise.reject(error);
  }
);

// Authentication API Service
export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginCredentials): Promise<ApiResponse<{
    user: AuthUser;
    access: string;
    refresh: string;
    expires_in: number;
  }>> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/login/', credentials);
      
      if (response.data.success && response.data.data) {
        const { access, refresh, expires_in } = response.data.data;
        
        // Store tokens
        TokenManager.setTokens(access, refresh, expires_in);
        
        return response.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Register new user
   */
  static async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: string;
    shop_name?: string;
    shop_owner_name?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/register/', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<ApiResponse> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      const accessToken = TokenManager.getAccessToken();
      
      if (refreshToken) {
        console.log('🚪 Logout attempt with tokens:', { 
          hasRefreshToken: !!refreshToken,
          hasAccessToken: !!accessToken
        });
        
        // Try different payload formats that Django backends commonly expect
        const payloadOptions = [
          // Option 1: Just refresh token (Django simple-jwt standard)
          { refresh: refreshToken },
          
          // Option 2: refresh_token field name
          { refresh_token: refreshToken },
          
          // Option 3: Both tokens
          { 
            refresh: refreshToken,
            access: accessToken 
          },
          
          // Option 4: Empty payload (some backends don't need token for logout)
          {},
          
          // Option 5: Token in different structure
          { 
            token: refreshToken,
            type: 'refresh'
          }
        ];

        let logoutSuccess = false;
        
        for (let i = 0; i < payloadOptions.length; i++) {
          try {
            console.log(`🔄 Trying logout payload ${i + 1}:`, payloadOptions[i]);
            
            await apiClient.post<ApiResponse>('/auth/logout/', payloadOptions[i]);
            
            console.log('✅ Logout API successful with payload:', payloadOptions[i]);
            logoutSuccess = true;
            break;
            
          } catch (payloadError: any) {
            console.log(`❌ Logout payload ${i + 1} failed:`, payloadError.response?.data);
            
            // If this is the last attempt, we'll handle it below
            if (i === payloadOptions.length - 1) {
              throw payloadError;
            }
          }
        }
        
        if (!logoutSuccess) {
          console.warn('⚠️ All logout payload formats failed, continuing with local logout');
        }
      }
      
      // Clear tokens regardless of API response
      TokenManager.clearTokens();
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      // Clear tokens even if API call fails
      TokenManager.clearTokens();
      console.error('Logout error (but continuing with local logout):', error);
      
      // Still return success since local logout is what matters most
      return {
        success: true,
        message: 'Logged out successfully (local logout completed)'
      };
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/forgot-password/', data);
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/reset-password/', {
        token: data.token,
        new_password: data.password,
        new_password_confirm: data.confirmPassword
      });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/verify-email/', { token });
      return response.data;
    } catch (error) {
      console.error('Email verification error:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Resend email verification
   */
  static async resendVerification(email: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/resend-verification/', { email });
      return response.data;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(): Promise<ApiResponse<AuthUser>> {
    try {
      const response = await apiClient.get<ApiResponse<AuthUser>>('/auth/profile/');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userData: Partial<AuthUser>): Promise<ApiResponse<AuthUser>> {
    try {
      const response = await apiClient.patch<ApiResponse<AuthUser>>('/auth/profile/', userData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Change password
   */
  static async changePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/auth/change-password/', data);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}${API_PREFIX}/auth/token/refresh/`, {
        refresh: refreshToken
      });

      const { access, refresh, expires_in } = response.data;
      TokenManager.setTokens(access, refresh, expires_in);
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      TokenManager.clearTokens();
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = TokenManager.getAccessToken();
    return token !== null && !TokenManager.isTokenExpired();
  }

  /**
   * Handle API errors consistently
   */
  public static handleApiError(error: any): Error {
    console.error('API Error Details:', {
      message: error.message,
      code: error.code,
      request: error.request ? 'Request made but no response' : 'No request made',
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      } : 'No response received',
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        baseURL: error.config.baseURL
      } : 'No config'
    });

    if (error.response?.data) {
      const apiError = error.response.data;
      
      // Return formatted error message
      const message = apiError.message || 
                     apiError.errors?.non_field_errors?.[0] ||
                     Object.values(apiError.errors || {})[0] ||
                     'An unexpected error occurred';
      
      const formattedError = new Error(message);
      (formattedError as any).status = error.response.status;
      (formattedError as any).errors = apiError.errors;
      
      return formattedError;
    }
    
    if (error.request) {
      const networkError = new Error(`Network error: Unable to connect to API server at ${error.config?.baseURL || 'unknown URL'}. Please check if the server is running.`);
      console.error('Network error details:', {
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout
      });
      return networkError;
    }
    
    return new Error(error.message || 'An unexpected error occurred');
  }
}

// Export token manager for use in other parts of the app
export { TokenManager };

// Barbershop API Service  
export class BarbershopService {
  /**
   * Get all services for the barbershop
   */
  static async getServices(): Promise<ApiResponse> {
    try {
      const response = await apiClient.get<ApiResponse>('/barbershop/services/');
      return response.data;
    } catch (error) {
      console.error('Get services error:', error);
      throw AuthService.handleApiError(error);
    }
  }

  /**
   * Get active services for the barbershop
   */
  static async getActiveServices(): Promise<ApiResponse> {
    try {
      const response = await apiClient.get<ApiResponse>('/barbershop/services/active/');
      return response.data;
    } catch (error) {
      console.error('Get active services error:', error);
      throw AuthService.handleApiError(error);
    }
  }

  /**
   * Create a new service
   */
  static async createService(serviceData: {
    name: string;
    price: number;
    description?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/barbershop/services/', serviceData);
      return response.data;
    } catch (error) {
      console.error('Create service error:', error);
      throw AuthService.handleApiError(error);
    }
  }

  /**
   * Update an existing service
   */
  static async updateService(id: number, serviceData: {
    name?: string;
    price?: number;
    description?: string;
    is_active?: boolean;
  }): Promise<ApiResponse> {
    try {
      const response = await apiClient.put<ApiResponse>(`/barbershop/services/${id}/`, serviceData);
      return response.data;
    } catch (error) {
      console.error('Update service error:', error);
      throw AuthService.handleApiError(error);
    }
  }

  /**
   * Delete a service
   */
  static async deleteService(id: number): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete<ApiResponse>(`/barbershop/services/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Delete service error:', error);
      throw AuthService.handleApiError(error);
    }
  }
}

// Helper function to setup automatic token refresh
export const setupTokenRefresh = (): void => {
  // Check token status every minute
  setInterval(() => {
    if (AuthService.isAuthenticated() && TokenManager.isTokenExpiringSoon()) {
      AuthService.refreshToken().catch(console.error);
    }
  }, 60000); // 1 minute
};