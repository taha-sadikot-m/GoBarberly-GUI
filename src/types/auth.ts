import type { UserRole } from './user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  shopName?: string; // For barbershop users
  shopOwnerName?: string; // For barbershop users
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  expiresAt: Date;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type { UserRole };