// Core Data Models
export interface Appointment {
  id: string;
  customer: string;
  phone: string;
  service: string;
  barber: string;
  date: string;
  time: string;
  amount?: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
}

export interface Sale {
  id: number;
  date: string;
  customer: string;
  service: string;
  barber: string;
  amount: number;
  payment: 'Cash' | 'UPI' | 'Card' | 'Paytm';
}

export interface Staff {
  name: string;
  role: 'Barber' | 'Senior Barber' | 'Manager' | 'Receptionist';
  phone: string;
  email: string;
  schedule: string;
  status: 'Active' | 'Inactive';
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  visits: number;
  lastVisit: string;
  notes?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: 'Hair Products' | 'Shaving' | 'Tools' | 'Cleaning' | 'Other';
  quantity: number;
  min_stock: number; // Backend uses snake_case
  unit_cost?: number;
  supplier?: string;
  created_at?: string;
  updated_at?: string;
  is_low_stock?: boolean;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface BarbershopService {
  id: number;
  name: string;
  price: string | number; // Backend returns string, frontend uses number
  description?: string;
  formatted_price?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceData {
  name: string;
  price: number;
  description?: string;
}

export interface UpdateServiceData {
  name?: string;
  price?: number;
  description?: string;
  is_active?: boolean;
}

export interface HistoryEntry {
  timestamp: string;
  action: string;
  section: string;
  details: string;
  user: string;
}

export interface StaffOverride {
  id: number;
  name: string;
  date: string;
  start: string;
  end: string;
}

// App State
export interface AppData {
  appointments: Appointment[];
  sales: Sale[];
  staff: Staff[];
  inventory: InventoryItem[];
  customers: Customer[];
  staffOverrides: StaffOverride[];
  history: HistoryEntry[];
}

// Organization Settings
export interface OrganizationSettings {
  currencySymbol: string;
  currencyCode: string;
  timezone: string;
  fyStartMonth: number;
  fyStartDay: number;
  openHour: number;
  closeHour: number;
  slotMinutes: number;
}

// Date Range
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export type RangeType = 'today' | 'week' | 'month' | 'fy' | 'custom';

// UI Component Props
export interface ButtonProps {
  variant?: 'primary' | 'ghost' | 'danger' | 'week';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  title?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onRowClick?: (item: T) => void;
}

export interface SelectOption {
  value: string;
  label: string;
  'data-price'?: string;
}

export interface InputProps {
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
  step?: string;
  disabled?: boolean;
}

export interface SelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  className?: string;
  id?: string;
  required?: boolean;
}

// Navigation
export type NavigationItem = {
  id: string;
  label: string;
  icon: string;
  path: string;
};

// Chart Data Types
export interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderRadius?: number;
  tension?: number;
  fill?: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}