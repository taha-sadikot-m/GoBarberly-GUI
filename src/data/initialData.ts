import type { AppData, OrganizationSettings } from '../types';

// Organization Settings
export const ORG: OrganizationSettings = {
  currencySymbol: '₹',
  currencyCode: 'INR',
  timezone: 'Asia/Kolkata',
  fyStartMonth: 4,
  fyStartDay: 1,
  openHour: 9,
  closeHour: 19,
  slotMinutes: 30,
};

// Initial seed data
export const initialData: AppData = {
  appointments: [
    {
      id: '1',
      customer: 'Arjun Sharma',
      phone: '9876543210',
      service: 'Haircut',
      barber: 'Rajesh Kumar',
      date: '2025-11-02',
      time: '09:00',
      status: 'Confirmed',
    },
    {
      id: '2',
      customer: 'Priya Singh',
      phone: '9876543211',
      service: 'Hair Color',
      barber: 'Suresh Patel',
      date: '2025-11-02',
      time: '10:30',
      status: 'Confirmed',
    },
    {
      id: '3',
      customer: 'Rahul Gupta',
      phone: '9876543212',
      service: 'Hair + Beard',
      barber: 'Rajesh Kumar',
      date: '2025-11-03',
      time: '14:00',
      status: 'Pending',
    },
  ],
  sales: [
    {
      id: 1,
      date: '2025-10-12T09:45:00',
      customer: 'Arjun Sharma',
      service: 'Haircut',
      barber: 'Rajesh Kumar',
      amount: 300,
      payment: 'UPI',
    },
    {
      id: 2,
      date: '2025-10-13T11:15:00',
      customer: 'Priya Singh',
      service: 'Hair Color',
      barber: 'Suresh Patel',
      amount: 500,
      payment: 'Card',
    },
    {
      id: 3,
      date: '2025-10-14T16:30:00',
      customer: 'Rohit Kumar',
      service: 'Beard Trim',
      barber: 'Rajesh Kumar',
      amount: 200,
      payment: 'Cash',
    },
  ],
  staff: [
    {
      name: 'Rajesh Kumar',
      role: 'Senior Barber',
      phone: '9876543201',
      email: 'rajesh@barbershop.com',
      schedule: 'Mon-Fri 9AM-6PM',
      status: 'Active',
    },
    {
      name: 'Suresh Patel',
      role: 'Barber',
      phone: '9876543202',
      email: 'suresh@barbershop.com',
      schedule: 'Tue-Sat 10AM-7PM',
      status: 'Active',
    },
    {
      name: 'Amit Singh',
      role: 'Barber',
      phone: '9876543203',
      email: 'amit@barbershop.com',
      schedule: 'Mon-Sat 9AM-6PM',
      status: 'Active',
    },
  ],
  inventory: [
    {
      id: 1,
      name: 'Hair Gel',
      category: 'Hair Products',
      quantity: 25,
      min_stock: 10,
    },
    {
      id: 2,
      name: 'Shampoo',
      category: 'Hair Products',
      quantity: 15,
      min_stock: 5,
    },
    {
      id: 3,
      name: 'Razor Blades',
      category: 'Shaving',
      quantity: 50,
      min_stock: 20,
    },
    {
      id: 4,
      name: 'Hair Clippers',
      category: 'Tools',
      quantity: 3,
      min_stock: 2,
    },
    {
      id: 5,
      name: 'Disinfectant',
      category: 'Cleaning',
      quantity: 8,
      min_stock: 5,
    },
  ],
  customers: [
    {
      id: 1,
      name: 'Arjun Sharma',
      phone: '9876543210',
      email: 'arjun@email.com',
      visits: 12,
      lastVisit: '2025-10-12',
      notes: 'Prefers fade cuts',
    },
    {
      id: 2,
      name: 'Priya Singh',
      phone: '9876543211',
      email: 'priya@email.com',
      visits: 8,
      lastVisit: '2025-10-13',
      notes: 'Regular hair color customer',
    },
    {
      id: 3,
      name: 'Rohit Kumar',
      phone: '9876543212',
      email: 'rohit@email.com',
      visits: 5,
      lastVisit: '2025-10-14',
      notes: 'Sensitive skin',
    },
  ],
  staffOverrides: [
    {
      id: 1,
      name: 'Rajesh Kumar',
      date: '2025-10-20',
      start: '10:00',
      end: '17:00',
    },
  ],
  history: [
    {
      timestamp: '2025-10-14T10:30:00',
      action: 'Added',
      section: 'appointments',
      details: 'Rahul Gupta on 2025-10-18 14:00',
      user: 'admin',
    },
    {
      timestamp: '2025-10-14T09:15:00',
      action: 'Added',
      section: 'sales',
      details: 'Rohit Kumar - Beard Trim',
      user: 'admin',
    },
  ],
};

// Service options with pricing
export const serviceOptions = [
  { value: '', label: 'Select Service' },
  { value: 'Haircut', label: 'Haircut - ₹300', 'data-price': '300' },
  { value: 'Beard Trim', label: 'Beard Trim - ₹200', 'data-price': '200' },
  { value: 'Hair + Beard', label: 'Hair + Beard - ₹450', 'data-price': '450' },
  { value: 'Shave', label: 'Shave - ₹250', 'data-price': '250' },
  { value: 'Hair Color', label: 'Hair Color - ₹500', 'data-price': '500' },
];

// Payment options
export const paymentOptions = [
  { value: 'Cash', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Card', label: 'Card' },
  { value: 'Paytm', label: 'Paytm' },
];

// Staff role options
export const staffRoleOptions = [
  { value: 'Barber', label: 'Barber' },
  { value: 'Senior Barber', label: 'Senior Barber' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Receptionist', label: 'Receptionist' },
];

// Inventory category options
export const inventoryCategoryOptions = [
  { value: 'Hair Products', label: 'Hair Products' },
  { value: 'Shaving', label: 'Shaving' },
  { value: 'Tools', label: 'Tools' },
  { value: 'Cleaning', label: 'Cleaning' },
  { value: 'Other', label: 'Other' },
];

// Appointment status options
export const appointmentStatusOptions = [
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Completed', label: 'Completed' },
];