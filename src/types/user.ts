// User roles in the system
export const UserRole = {
  SUPER_ADMIN: 'super_admin' as const,
  ADMIN: 'admin' as const,
  BARBERSHOP: 'barbershop' as const
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Super Admin user
export interface SuperAdmin extends User {
  role: 'super_admin';
  permissions: string[];
}

// Admin user 
export interface Admin extends User {
  role: 'admin';
  createdBy: string; // Super Admin ID who created this admin
  managedBarbershops: string[]; // Array of barbershop IDs they manage
}

// Barbershop user
export interface Barbershop extends User {
  role: 'barbershop';
  shopName: string;
  shopOwnerName: string;
  shopLogo?: string;
  address?: string;
  phone?: string;
  createdBy: string; // Super Admin or Admin ID who created this barbershop
  subscription?: {
    plan: string;
    status: 'active' | 'inactive' | 'suspended';
    expiresAt: Date;
  };
}

// Form interfaces for creating/editing users
export interface CreateAdminRequest {
  email: string;
  name: string;
  password: string;
}

export interface CreateBarbershopRequest {
  email: string;
  shopName: string;
  shopOwnerName: string;
  shopLogo?: File | string;
  address?: string;
  phone?: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  isActive?: boolean;
}

export interface UpdateBarbershopRequest extends UpdateUserRequest {
  shopName?: string;
  shopOwnerName?: string;
  shopLogo?: File | string;
  address?: string;
  phone?: string;
}

// Authentication types - updated
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  shopName?: string; // For barbershop users
  shopOwnerName?: string; // For barbershop users
}

// Dashboard stats interfaces
export interface SuperAdminStats {
  totalAdmins: number;
  totalBarbershops: number;
  activeBarbershops: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export interface AdminStats {
  totalBarbershops: number;
  activeBarbershops: number;
  totalAppointments: number;
  monthlyRevenue: number;
}