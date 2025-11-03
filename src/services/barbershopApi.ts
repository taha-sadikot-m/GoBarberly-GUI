import axios from 'axios';

// Create axios instance for barbershop operations
const barbershopApi = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/barbershop',
  timeout: 10000,
});

// Add auth token to requests
barbershopApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('gobarberly_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
barbershopApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        const refreshToken = localStorage.getItem('gobarberly_refresh_token');
        if (refreshToken) {
          const refreshResponse = await axios.post('http://127.0.0.1:8000/api/auth/token/refresh/', {
            refresh: refreshToken
          });
          
          const newToken = refreshResponse.data.access;
          localStorage.setItem('gobarberly_access_token', newToken);
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return barbershopApi.request(error.config);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('gobarberly_access_token');
        localStorage.removeItem('gobarberly_refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface DashboardStats {
  today_appointments: number;
  pending_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  today_sales: number;
  total_sales: number;
  active_staff: number;
  total_customers: number;
  low_stock_items: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  appointments: number;
}

export interface ServicePopularity {
  service: string;
  count: number;
  revenue: number;
}

export interface StaffPerformance {
  staff_name: string;
  total_services: number;
  total_revenue: number;
}

export interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  barber_name: string;
  amount?: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  duration_minutes?: number;
  notes?: string;
}

export interface Sale {
  id: number;
  customer_name: string;
  service: string;
  amount: number;
  payment_method: string;
  sale_date: string;
  barber_name: string;
}

export interface Staff {
  id: number;
  name: string;
  role: string;
  phone: string;
  email?: string | null;
  join_date: string | null;  // Backend uses join_date, not hire_date
  status: 'Active' | 'Inactive' | 'On Leave';  // Added 'On Leave' status
  salary?: string | number | null;    // Backend returns salary as string, frontend may use number or string
  schedule?: string;  // Added schedule field from backend
  is_barber?: boolean; // Added is_barber computed field
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  total_visits: number;
  total_spent: number;
  last_visit_date: string;
  notes?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: 'Hair Products' | 'Shaving' | 'Tools' | 'Cleaning' | 'Other';
  quantity: number;
  min_stock: number; // Backend uses snake_case
  unit_cost?: number;
  selling_price?: number;
  supplier?: string;
  created_at?: string;
  updated_at?: string;
  is_low_stock?: boolean;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  profit_margin?: number;
  profit_per_unit?: number;
}

export interface ActivityLog {
  id: number;
  action_type: string;
  description: string;
  created_at: string;
}

// Dashboard APIs
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await barbershopApi.get('/dashboard/stats/');
    return response.data;
  },

  getMonthlyRevenue: async (): Promise<MonthlyRevenue[]> => {
    const response = await barbershopApi.get('/dashboard/monthly-revenue/');
    return response.data;
  },

  getServicePopularity: async (): Promise<ServicePopularity[]> => {
    const response = await barbershopApi.get('/dashboard/service-popularity/');
    return response.data;
  },

  getStaffPerformance: async (): Promise<StaffPerformance[]> => {
    const response = await barbershopApi.get('/dashboard/staff-performance/');
    return response.data;
  },
};

// Barbershop Profile APIs
export const barbershopProfileService = {
  getProfile: async (): Promise<{ 
    id: number;
    shop_name: string;
    shop_owner_name: string;
    shop_logo?: string;
    address?: string;
    phone_number?: string;
    email: string;
  }> => {
    try {
      const response = await barbershopApi.get('/profile/');
      return response.data;
    } catch (error: any) {
      // Re-throw the error so the hook can handle it appropriately
      throw error;
    }
  },

  updateProfile: async (data: {
    shop_name?: string;
    shop_owner_name?: string;
    shop_logo?: File | string;
    address?: string;
    phone_number?: string;
  }): Promise<any> => {
    const formData = new FormData();
    
    if (data.shop_name) formData.append('shop_name', data.shop_name);
    if (data.shop_owner_name) formData.append('shop_owner_name', data.shop_owner_name);
    if (data.address) formData.append('address', data.address);
    if (data.phone_number) formData.append('phone_number', data.phone_number);
    
    if (data.shop_logo instanceof File) {
      formData.append('shop_logo', data.shop_logo);
    } else if (typeof data.shop_logo === 'string' && data.shop_logo) {
      formData.append('shop_logo', data.shop_logo);
    }

    const response = await barbershopApi.patch('/profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Appointment APIs
export const appointmentService = {
  getAll: async (params?: { 
    date?: string; 
    status?: string; 
    barber?: string; 
    page?: number; 
  }): Promise<{ results: Appointment[]; count: number }> => {
    const response = await barbershopApi.get('/appointments/', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Appointment> => {
    const response = await barbershopApi.get(`/appointments/${id}/`);
    return response.data;
  },

  create: async (data: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const response = await barbershopApi.post('/appointments/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
    const response = await barbershopApi.patch(`/appointments/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await barbershopApi.delete(`/appointments/${id}/`);
  },

  getTodayAppointments: async (): Promise<Appointment[]> => {
    const response = await barbershopApi.get('/appointments/today/');
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<Appointment> => {
    const response = await barbershopApi.patch(`/appointments/${id}/status/`, { status });
    return response.data;
  },

  quickAppointment: async (data: {
    customer_name?: string;
    customer_phone?: string;
    service: string;
    barber_name: string;
  }): Promise<Appointment> => {
    const response = await barbershopApi.post('/quick/appointment/', data);
    return response.data;
  },
};

// Sales APIs
export const salesService = {
  getAll: async (params?: {
    start_date?: string;
    end_date?: string;
    payment_method?: string;
    service?: string;
    page?: number;
  }): Promise<{ results: Sale[]; count: number }> => {
    const response = await barbershopApi.get('/sales/', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Sale> => {
    const response = await barbershopApi.get(`/sales/${id}/`);
    return response.data;
  },

  create: async (data: Omit<Sale, 'id' | 'sale_date'>): Promise<Sale> => {
    const response = await barbershopApi.post('/sales/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Sale>): Promise<Sale> => {
    const response = await barbershopApi.patch(`/sales/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await barbershopApi.delete(`/sales/${id}/`);
  },

  getDailySummary: async (date?: string): Promise<{
    total_sales: number;
    total_transactions: number;
    payment_breakdown: any[];
    service_breakdown: any[];
  }> => {
    const response = await barbershopApi.get('/sales/daily-summary/', {
      params: { date }
    });
    return response.data;
  },

  quickSale: async (data: {
    customer_name?: string;
    service: string;
    amount: number;
    payment_method?: string;
    barber_name: string;
  }): Promise<Sale> => {
    const response = await barbershopApi.post('/quick/sale/', data);
    return response.data;
  },
};

// Staff APIs
export const staffService = {
  getAll: async (params?: {
    status?: string;
    role?: string;
    page?: number;
  }): Promise<{ results: Staff[]; count: number }> => {
    const response = await barbershopApi.get('/staff/', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Staff> => {
    const response = await barbershopApi.get(`/staff/${id}/`);
    return response.data;
  },

  create: async (data: Omit<Staff, 'id'>): Promise<Staff> => {
    const response = await barbershopApi.post('/staff/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Staff>): Promise<Staff> => {
    const response = await barbershopApi.patch(`/staff/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await barbershopApi.delete(`/staff/${id}/`);
  },

  getActiveBarbers: async (): Promise<{ name: string; role: string }[]> => {
    const response = await barbershopApi.get('/staff/active-barbers/');
    return response.data;
  },
};

// Customer APIs
export const customerService = {
  getAll: async (params?: {
    search?: string;
    page?: number;
  }): Promise<{ results: Customer[]; count: number }> => {
    const response = await barbershopApi.get('/customers/', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await barbershopApi.get(`/customers/${id}/`);
    return response.data;
  },

  create: async (data: Omit<Customer, 'id' | 'total_visits' | 'total_spent' | 'last_visit_date'>): Promise<Customer> => {
    const response = await barbershopApi.post('/customers/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    const response = await barbershopApi.patch(`/customers/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await barbershopApi.delete(`/customers/${id}/`);
  },

  updateStats: async (id: number): Promise<Customer> => {
    const response = await barbershopApi.post(`/customers/${id}/update-stats/`);
    return response.data;
  },
};

// Inventory APIs
export const inventoryService = {
  getAll: async (params?: {
    category?: string;
    stock_status?: 'low_stock' | 'out_of_stock';
    page?: number;
  }): Promise<{ results: InventoryItem[]; count: number }> => {
    const response = await barbershopApi.get('/inventory/', { params });
    return response.data;
  },

  getById: async (id: number): Promise<InventoryItem> => {
    const response = await barbershopApi.get(`/inventory/${id}/`);
    return response.data;
  },

  create: async (data: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
    const response = await barbershopApi.post('/inventory/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await barbershopApi.patch(`/inventory/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await barbershopApi.delete(`/inventory/${id}/`);
  },

  getLowStockAlerts: async (): Promise<InventoryItem[]> => {
    const response = await barbershopApi.get('/inventory/low-stock/');
    return response.data;
  },
};

// Activity Log APIs
export const activityService = {
  getAll: async (params?: {
    action_type?: string;
    start_date?: string;
    page?: number;
  }): Promise<{ results: ActivityLog[]; count: number }> => {
    const response = await barbershopApi.get('/activity-logs/', { params });
    return response.data;
  },
};

// Reports APIs
export const reportsService = {
  getSummary: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{
    date_range: { start: string; end: string };
    revenue: any;
    appointments: any;
    services: any[];
    staff_performance: any[];
  }> => {
    const response = await barbershopApi.get('/reports/summary/', { params });
    return response.data;
  },

  getAnalytics: async (): Promise<{
    date_range: { start: string; end: string };
    daily_revenue: { date: string; revenue: number }[];
    service_performance: any[];
    customer_retention: any;
    peak_hours: any[];
  }> => {
    const response = await barbershopApi.get('/reports/analytics/');
    return response.data;
  },

  exportData: async (params?: {
    type?: 'all' | 'appointments' | 'sales' | 'customers' | 'inventory';
    start_date?: string;
    end_date?: string;
  }): Promise<any> => {
    const response = await barbershopApi.get('/reports/export/', { params });
    return response.data;
  },
};

// Calendar and Scheduling APIs
export const scheduleService = {
  getCalendarView: async (params?: {
    month?: number;
    year?: number;
  }): Promise<{
    month: number;
    year: number;
    appointments: { [date: string]: any[] };
  }> => {
    const response = await barbershopApi.get('/calendar/', { params });
    return response.data;
  },

  getScheduleGrid: async (date?: string): Promise<{
    date: string;
    staff: { name: string; role: string }[];
    time_slots: string[];
    appointments: any[];
  }> => {
    const response = await barbershopApi.get('/schedule/grid/', {
      params: { date }
    });
    return response.data;
  },

  getAvailableSlots: async (params: {
    date: string;
    barber?: string;
  }): Promise<{
    date: string;
    barber?: string;
    time_slots: { time: string; available: boolean }[];
  }> => {
    const response = await barbershopApi.get('/schedule/available-slots/', { params });
    return response.data;
  },

  blockTimeSlot: async (data: {
    date: string;
    time: string;
    barber_name: string;
    reason?: string;
  }): Promise<{ success: boolean; appointment_id: string; message: string }> => {
    const response = await barbershopApi.post('/schedule/block-slot/', data);
    return response.data;
  },
};

// Staff Availability API
export interface StaffAvailability {
  id: number;
  staff: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
  is_available: boolean;
  notes: string;
}

export const staffAvailabilityService = {
  getAvailability: async (params?: {
    staff_name?: string;
    date?: string;
  }): Promise<StaffAvailability[]> => {
    const response = await barbershopApi.get('/staff/availability/', { params });
    return response.data;
  },

  createAvailability: async (data: Partial<StaffAvailability>): Promise<StaffAvailability> => {
    const response = await barbershopApi.post('/staff/availability/', data);
    return response.data;
  },

  updateAvailability: async (id: number, data: Partial<StaffAvailability>): Promise<StaffAvailability> => {
    const response = await barbershopApi.put(`/staff/availability/${id}/`, data);
    return response.data;
  },

  deleteAvailability: async (id: number): Promise<void> => {
    await barbershopApi.delete(`/staff/availability/${id}/`);
  },
};

export default barbershopApi;