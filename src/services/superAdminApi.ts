import type { 
  AxiosResponse, 
  AxiosError 
} from 'axios';
import { apiClient } from './api';

// SuperAdmin specific types
export interface SuperAdminStats {
  total_admins: number;
  total_barbershops: number;
  active_barbershops: number;
  total_revenue: number;
  monthly_growth: number;
}

export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
  managed_barbershops_count: number;
  created_by_name: string;
}

export interface CreateAdminRequest {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

export interface UpdateAdminRequest {
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  phone_number?: string;
}

export interface Subscription {
  id: number;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  started_at: string;
  expires_at: string;
  features: Record<string, any>;
  max_appointments: number;
  max_staff: number;
  is_expired: boolean;
  is_active: boolean;
  days_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface BarbershopUser {
  id: number;
  email: string;
  name: string;
  shop_name: string;
  shop_owner_name: string;
  shop_logo?: string;
  address?: string;
  phone_number?: string;
  role: string;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
  subscription?: Subscription;
  created_by_name: string;
}

export interface CreateBarbershopRequest {
  email: string;
  shop_name: string;
  shop_owner_name: string;
  shop_logo?: File | string;
  address?: string;
  phone_number?: string;
  password: string;
  password_confirm: string;
  subscription_plan?: 'basic' | 'premium' | 'enterprise';
}

export interface UpdateBarbershopRequest {
  shop_name?: string;
  shop_owner_name?: string;
  shop_logo?: File | string;
  address?: string;
  phone_number?: string;
  is_active?: boolean;
  subscription_plan?: 'basic' | 'premium' | 'enterprise';
  subscription_status?: 'active' | 'inactive' | 'suspended';
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message: string;
  count?: number;
}

export interface SearchParams {
  search?: string;
  is_active?: boolean;
  plan?: string;
  page?: number;
  page_size?: number;
}

// SuperAdmin API Service Class
export class SuperAdminService {
  private readonly baseURL = '/super-admin';

  // Helper method to handle API responses
  private handleResponse<T>(response: AxiosResponse<APIResponse<T>>): T {
    if (!response.data.success) {
      throw new Error(response.data.message || 'API request failed');
    }
    return response.data.data;
  }

  // Helper method to handle API errors
  private handleError(error: AxiosError): never {
    console.error('SuperAdmin API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers
    });
    
    if (error.response?.data) {
      const errorData = error.response.data as any;
      throw new Error(errorData.message || errorData.detail || 'API request failed');
    }
    throw new Error(error.message || 'Network error occurred');
  }

  // Dashboard Methods
  async getDashboardStats(): Promise<SuperAdminStats> {
    try {
      const response = await apiClient.get<APIResponse<SuperAdminStats>>(
        `${this.baseURL}/dashboard/stats/`
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getDashboardData(): Promise<{
    stats: SuperAdminStats;
    recent_admins: AdminUser[];
    recent_barbershops: BarbershopUser[];
  }> {
    try {
      const response = await apiClient.get<APIResponse<{
        stats: SuperAdminStats;
        recent_admins: AdminUser[];
        recent_barbershops: BarbershopUser[];
      }>>(`${this.baseURL}/dashboard/data/`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Admin Management Methods
  async getAdmins(params?: SearchParams): Promise<{ admins: AdminUser[]; count: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const url = `${this.baseURL}/admins/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient.get<APIResponse<AdminUser[]>>(url);
      
      return {
        admins: this.handleResponse(response),
        count: response.data.count || 0
      };
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getAdmin(id: number): Promise<AdminUser> {
    try {
      const response = await apiClient.get<APIResponse<AdminUser>>(
        `${this.baseURL}/admins/${id}/`
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async createAdmin(data: CreateAdminRequest): Promise<AdminUser> {
    try {
      const response = await apiClient.post<APIResponse<AdminUser>>(
        `${this.baseURL}/admins/`,
        data
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async updateAdmin(id: number, data: UpdateAdminRequest): Promise<AdminUser> {
    try {
      const response = await apiClient.patch<APIResponse<AdminUser>>(
        `${this.baseURL}/admins/${id}/`,
        data
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async deleteAdmin(id: number): Promise<void> {
    try {
      await apiClient.delete<APIResponse<null>>(
        `${this.baseURL}/admins/${id}/`
      );
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async toggleAdminStatus(id: number): Promise<AdminUser> {
    try {
      const response = await apiClient.patch<APIResponse<AdminUser>>(
        `${this.baseURL}/admins/${id}/toggle-status/`
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async transferAdminOwnership(fromAdminId: number, toAdminId: number): Promise<{ transferred_count: number; from_admin: string; to_admin: string; barbershop_names: string[] }> {
    try {
      const response = await apiClient.post<APIResponse<{ transferred_count: number; from_admin: string; to_admin: string; barbershop_names: string[] }>>(
        `${this.baseURL}/admins/${fromAdminId}/transfer-ownership/`,
        { to_admin_id: toAdminId }
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getAdminBarbershops(adminId: number): Promise<{ admin: { id: number; email: string; name: string }; barbershops: BarbershopUser[]; count: number }> {
    try {
      const response = await apiClient.get<APIResponse<{ admin: { id: number; email: string; name: string }; barbershops: BarbershopUser[]; count: number }>>(
        `${this.baseURL}/admins/${adminId}/barbershops/`
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Barbershop Management Methods
  async getBarbershops(params?: SearchParams): Promise<{ barbershops: BarbershopUser[]; count: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
      if (params?.plan) queryParams.append('plan', params.plan);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const url = `${this.baseURL}/barbershops/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient.get<APIResponse<BarbershopUser[]>>(url, {
        timeout: 30000 // 30 seconds timeout for barbershop loading
      });
      
      return {
        barbershops: this.handleResponse(response),
        count: response.data.count || 0
      };
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getBarbershop(id: number): Promise<BarbershopUser> {
    try {
      const response = await apiClient.get<APIResponse<BarbershopUser>>(
        `${this.baseURL}/barbershops/${id}/`
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async createBarbershop(data: CreateBarbershopRequest): Promise<BarbershopUser> {
    try {
      // Handle file upload if shop_logo is a File
      let requestData: any = { ...data };
      
      if (data.shop_logo && data.shop_logo instanceof File) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
        requestData = formData;
      }

      const response = await apiClient.post<APIResponse<BarbershopUser>>(
        `${this.baseURL}/barbershops/`,
        requestData,
        {
          headers: requestData instanceof FormData ? {
            'Content-Type': 'multipart/form-data'
          } : undefined
        }
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async updateBarbershop(id: number, data: UpdateBarbershopRequest): Promise<BarbershopUser> {
    try {
      // Handle file upload if shop_logo is a File
      let requestData: any = { ...data };
      
      if (data.shop_logo && data.shop_logo instanceof File) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
        requestData = formData;
      }

      const response = await apiClient.patch<APIResponse<BarbershopUser>>(
        `${this.baseURL}/barbershops/${id}/`,
        requestData,
        {
          headers: requestData instanceof FormData ? {
            'Content-Type': 'multipart/form-data'
          } : undefined
        }
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async deleteBarbershop(id: number): Promise<void> {
    try {
      await apiClient.delete<APIResponse<null>>(
        `${this.baseURL}/barbershops/${id}/`
      );
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async toggleBarbershopStatus(id: number): Promise<BarbershopUser> {
    try {
      const response = await apiClient.patch<APIResponse<BarbershopUser>>(
        `${this.baseURL}/barbershops/${id}/toggle-status/`
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Archive Management Methods
  async getArchivedAdmins(): Promise<{ admins: AdminUser[]; count: number }> {
    try {
      const response = await apiClient.get<any>(
        `${this.baseURL}/archive/admins/`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'API request failed');
      }
      
      return {
        admins: response.data.admins || [],
        count: response.data.count || 0
      };
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getArchivedBarbershops(): Promise<{ barbershops: BarbershopUser[]; count: number }> {
    try {
      const response = await apiClient.get<any>(
        `${this.baseURL}/archive/barbershops/`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'API request failed');
      }
      
      return {
        barbershops: response.data.barbershops || [],
        count: response.data.count || 0
      };
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async restoreUser(userId: number, userType: 'admin' | 'barbershop'): Promise<{ user: any; message: string }> {
    try {
      const response = await apiClient.post<APIResponse<{ user: any; message: string }>>(
        `${this.baseURL}/archive/restore/`,
        {
          user_id: userId,
          user_type: userType
        }
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }
}

// Export singleton instance
export const superAdminService = new SuperAdminService();