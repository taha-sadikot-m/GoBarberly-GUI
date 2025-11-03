import type { 
  AxiosResponse, 
  AxiosError 
} from 'axios';
import { apiClient } from './api';

// Admin specific types
export interface AdminStats {
  total_barbershops: number;
  active_barbershops: number;
  total_appointments: number;
  monthly_revenue: number;
}

export interface AdminDashboardData {
  stats: AdminStats;
  recent_activities: Activity[];
  recent_appointments: Appointment[];
  barbershop_summary: BarbershopUser[];
}

export interface Activity {
  id: number;
  action_type: string;
  description: string;
  timestamp: string;
  barbershop: {
    id: number;
    shop_name: string;
  };
  metadata?: Record<string, any>;
}

export interface Appointment {
  id: number;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  amount: number;
  notes?: string;
  barbershop: {
    id: number;
    shop_name: string;
  };
  created_at: string;
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
  subscription?: {
    id: number;
    plan: 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'inactive' | 'suspended' | 'expired';
    started_at: string;
    expires_at: string;
    is_active: boolean;
    days_remaining: number;
  };
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
  status?: 'active' | 'inactive';
  plan?: string;
  page?: number;
  page_size?: number;
}

// Admin API Service Class
export class AdminService {
  private readonly baseURL = '/admin';

  // Helper method to handle API responses
  private handleResponse<T>(response: AxiosResponse<APIResponse<T>>): T {
    if (!response.data.success) {
      throw new Error(response.data.message || 'API request failed');
    }
    return response.data.data;
  }

  // Helper method to handle API errors
  private handleError(error: AxiosError): never {
    console.error('Admin API Error:', {
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
  async getDashboardStats(): Promise<AdminStats> {
    try {
      const response = await apiClient.get<APIResponse<AdminStats>>(
        `${this.baseURL}/dashboard/stats/`
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getDashboardData(): Promise<AdminDashboardData> {
    try {
      const response = await apiClient.get<APIResponse<AdminDashboardData>>(
        `${this.baseURL}/dashboard/data/`
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Barbershop Management Methods (Admin Scoped)
  async getBarbershops(params?: SearchParams): Promise<{ barbershops: BarbershopUser[]; count: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.plan) queryParams.append('plan', params.plan);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const url = `${this.baseURL}/barbershops/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient.get<APIResponse<BarbershopUser[]>>(url, {
        timeout: 30000 // 30 seconds timeout for barbershop loading
      });
      
      // Extract count before calling handleResponse
      const count = response.data.count || 0;
      
      return {
        barbershops: this.handleResponse(response),
        count: count
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

  async toggleBarbershopStatus(id: number): Promise<{ message: string; is_active: boolean }> {
    try {
      const response = await apiClient.post<{ message: string; is_active: boolean }>(
        `${this.baseURL}/barbershops/${id}/toggle-status/`
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Activity Methods
  async getActivities(params?: {
    action_type?: string;
    barbershop?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ activities: Activity[]; count: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.action_type) queryParams.append('action_type', params.action_type);
      if (params?.barbershop) queryParams.append('barbershop', params.barbershop.toString());
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const url = `${this.baseURL}/activities/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient.get<APIResponse<Activity[]>>(url);
      
      return {
        activities: this.handleResponse(response),
        count: response.data.count || 0
      };
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Appointment Methods
  async getAppointments(params?: {
    status?: string;
    barbershop?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ appointments: Appointment[]; count: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.barbershop) queryParams.append('barbershop', params.barbershop.toString());
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

      const url = `${this.baseURL}/appointments/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient.get<APIResponse<Appointment[]>>(url);
      
      return {
        appointments: this.handleResponse(response),
        count: response.data.count || 0
      };
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Analytics Methods
  async getBarbershopAnalytics(barbershopId: number, days: number = 30): Promise<any> {
    try {
      const response = await apiClient.get<any>(
        `${this.baseURL}/barbershops/${barbershopId}/analytics/?days=${days}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Archive Management Methods
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

  async restoreBarbershop(barbershopId: number): Promise<{ barbershop: any; message: string }> {
    try {
      const response = await apiClient.post<APIResponse<{ barbershop: any; message: string }>>(
        `${this.baseURL}/archive/restore/`,
        {
          user_id: barbershopId
        }
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Transfer Management Methods
  async transferBarbershopOwnership(barbershopId: number, toAdminId: number): Promise<{
    barbershop: any;
    from_admin: any;
    to_admin: any;
    message: string;
  }> {
    try {
      const response = await apiClient.post<any>(
        `${this.baseURL}/transfer/barbershop/`,
        {
          barbershop_id: barbershopId,
          to_admin_id: toAdminId
        }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Transfer failed');
      }
      
      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getAvailableAdminsForTransfer(): Promise<{ admins: any[]; count: number }> {
    try {
      const response = await apiClient.get<any>(
        `${this.baseURL}/transfer/available-admins/`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get available admins');
      }
      
      return {
        admins: response.data.admins || [],
        count: response.data.count || 0
      };
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();