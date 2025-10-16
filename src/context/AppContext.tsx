import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppData, Appointment, Sale, Staff, Customer, InventoryItem, HistoryEntry, StaffOverride, RangeType, DateRange } from '../types';
import { initialData } from '../data/initialData';
import { saveToLocalStorage, loadFromLocalStorage, computeRange, generateId } from '../utils';

interface AppState {
  data: AppData;
  rangeState: {
    type: RangeType;
    start: Date | null;
    end: Date | null;
  };
  currentWeekOffset: number;
}

type AppAction =
  | { type: 'SET_DATA'; payload: Partial<AppData> }
  | { type: 'ADD_APPOINTMENT'; payload: Omit<Appointment, 'id'> }
  | { type: 'UPDATE_APPOINTMENT'; payload: { id: string; updates: Partial<Appointment> } }
  | { type: 'DELETE_APPOINTMENT'; payload: string }
  | { type: 'ADD_SALE'; payload: Omit<Sale, 'id' | 'date'> }
  | { type: 'UPDATE_SALE'; payload: { id: number; updates: Partial<Sale> } }
  | { type: 'DELETE_SALE'; payload: number }
  | { type: 'ADD_STAFF'; payload: Staff }
  | { type: 'UPDATE_STAFF'; payload: { index: number; updates: Staff } }
  | { type: 'DELETE_STAFF'; payload: number }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: { index: number; updates: Customer } }
  | { type: 'DELETE_CUSTOMER'; payload: number }
  | { type: 'ADD_CUSTOMER_ITEM'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER_ITEM'; payload: Customer }
  | { type: 'DELETE_CUSTOMER_ITEM'; payload: number }
  | { type: 'ADD_INVENTORY'; payload: InventoryItem }
  | { type: 'UPDATE_INVENTORY'; payload: { index: number; updates: InventoryItem } }
  | { type: 'DELETE_INVENTORY'; payload: number }
  | { type: 'ADD_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'UPDATE_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'DELETE_INVENTORY_ITEM'; payload: number }
  | { type: 'ADD_STAFF_OVERRIDE'; payload: Omit<StaffOverride, 'id'> }
  | { type: 'ADD_HISTORY'; payload: Omit<HistoryEntry, 'timestamp' | 'user'> }
  | { type: 'SET_RANGE'; payload: { type: RangeType; start?: Date | null; end?: Date | null } }
  | { type: 'SET_WEEK_OFFSET'; payload: number }
  | { type: 'LOAD_DATA'; payload: AppData };

const initialState: AppState = {
  data: initialData,
  rangeState: {
    type: 'month',
    ...computeRange('month'),
  },
  currentWeekOffset: 0,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        data: action.payload,
      };

    case 'SET_DATA':
      return {
        ...state,
        data: { ...state.data, ...action.payload },
      };

    case 'ADD_APPOINTMENT': {
      const newAppointment: Appointment = {
        ...action.payload,
        id: generateId(),
      };
      const updatedData = {
        ...state.data,
        appointments: [...state.data.appointments, newAppointment],
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Added',
            section: 'appointments',
            details: `${newAppointment.customer} on ${newAppointment.date} ${newAppointment.time}`,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'UPDATE_APPOINTMENT': {
      const appointments = state.data.appointments.map(apt =>
        apt.id === action.payload.id ? { ...apt, ...action.payload.updates } : apt
      );
      const updatedData = {
        ...state.data,
        appointments,
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Updated',
            section: 'appointments',
            details: `#${action.payload.id}`,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'DELETE_APPOINTMENT': {
      const appointment = state.data.appointments.find(a => a.id === action.payload);
      const appointments = state.data.appointments.filter(a => a.id !== action.payload);
      const updatedData = {
        ...state.data,
        appointments,
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Deleted',
            section: 'appointments',
            details: `${appointment?.customer || 'Unknown'}`,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'ADD_SALE': {
      const newSale: Sale = {
        id: Date.now(),
        date: new Date().toISOString(),
        ...action.payload,
      };
      const updatedData = {
        ...state.data,
        sales: [...state.data.sales, newSale],
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Added',
            section: 'sales',
            details: `${newSale.customer} - ${newSale.service}`,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'UPDATE_SALE': {
      const sales = state.data.sales.map(sale =>
        sale.id === action.payload.id ? { ...sale, ...action.payload.updates } : sale
      );
      const updatedData = {
        ...state.data,
        sales,
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Updated',
            section: 'sales',
            details: `#${action.payload.id}`,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'DELETE_SALE': {
      const sale = state.data.sales.find(s => s.id === action.payload);
      const sales = state.data.sales.filter(s => s.id !== action.payload);
      const updatedData = {
        ...state.data,
        sales,
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Deleted',
            section: 'sales',
            details: `Sale: ${sale?.customer || 'Unknown'} - ${sale?.service || 'Unknown'}`,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'ADD_STAFF': {
      const updatedData = {
        ...state.data,
        staff: [...state.data.staff, action.payload],
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Added',
            section: 'staff',
            details: action.payload.name,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'UPDATE_STAFF': {
      const staff = [...state.data.staff];
      staff[action.payload.index] = action.payload.updates;
      const updatedData = {
        ...state.data,
        staff,
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Updated',
            section: 'staff',
            details: action.payload.updates.name,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'DELETE_STAFF': {
      const staffMember = state.data.staff[action.payload];
      const staff = state.data.staff.filter((_, i) => i !== action.payload);
      const staffOverrides = state.data.staffOverrides.filter(o => o.name !== staffMember?.name);
      const updatedData = {
        ...state.data,
        staff,
        staffOverrides,
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Deleted',
            section: 'staff',
            details: `Staff ${staffMember?.name || 'Unknown'}`,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'ADD_CUSTOMER': {
      const updatedData = {
        ...state.data,
        customers: [...state.data.customers, action.payload],
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Added',
            section: 'customers',
            details: action.payload.name,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'UPDATE_CUSTOMER': {
      const customers = [...state.data.customers];
      customers[action.payload.index] = action.payload.updates;
      const updatedData = {
        ...state.data,
        customers,
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Updated',
            section: 'customers',
            details: action.payload.updates.name,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'DELETE_CUSTOMER': {
      const customer = state.data.customers[action.payload];
      const customers = state.data.customers.filter((_, i) => i !== action.payload);
      const updatedData = {
        ...state.data,
        customers,
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Deleted',
            section: 'customers',
            details: `Customer ${customer?.name || 'Unknown'}`,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'ADD_INVENTORY': {
      const updatedData = {
        ...state.data,
        inventory: [...state.data.inventory, action.payload],
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Added',
            section: 'inventory',
            details: action.payload.name,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'UPDATE_INVENTORY': {
      const inventory = [...state.data.inventory];
      inventory[action.payload.index] = action.payload.updates;
      const updatedData = {
        ...state.data,
        inventory,
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Updated',
            section: 'inventory',
            details: action.payload.updates.name,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'DELETE_INVENTORY': {
      const item = state.data.inventory[action.payload];
      const inventory = state.data.inventory.filter((_, i) => i !== action.payload);
      const updatedData = {
        ...state.data,
        inventory,
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Deleted',
            section: 'inventory',
            details: `Item ${item?.name || 'Unknown'}`,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'ADD_STAFF_OVERRIDE': {
      const newOverride: StaffOverride = {
        ...action.payload,
        id: Date.now(),
      };
      const updatedData = {
        ...state.data,
        staffOverrides: [...state.data.staffOverrides, newOverride],
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Added',
            section: 'staff',
            details: `Availability: ${newOverride.name} on ${newOverride.date} ${newOverride.start}-${newOverride.end}`,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'ADD_INVENTORY_ITEM': {
      const updatedData = {
        ...state.data,
        inventory: [...state.data.inventory, action.payload],
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Added',
            section: 'inventory',
            details: action.payload.name,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'UPDATE_INVENTORY_ITEM': {
      const inventory = state.data.inventory.map(item =>
        item.id === action.payload.id ? action.payload : item
      );
      const updatedData = {
        ...state.data,
        inventory,
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Updated',
            section: 'inventory',
            details: action.payload.name,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'DELETE_INVENTORY_ITEM': {
      const item = state.data.inventory.find(i => i.id === action.payload);
      const inventory = state.data.inventory.filter(i => i.id !== action.payload);
      const updatedData = {
        ...state.data,
        inventory,
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Deleted',
            section: 'inventory',
            details: `Item ${item?.name || 'Unknown'}`,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'ADD_CUSTOMER_ITEM': {
      const updatedData = {
        ...state.data,
        customers: [...state.data.customers, action.payload],
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Added',
            section: 'customers',
            details: action.payload.name,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'UPDATE_CUSTOMER_ITEM': {
      const customers = state.data.customers.map(customer =>
        customer.id === action.payload.id ? action.payload : customer
      );
      const updatedData = {
        ...state.data,
        customers,
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Updated',
            section: 'customers',
            details: action.payload.name,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'DELETE_CUSTOMER_ITEM': {
      const customer = state.data.customers.find(c => c.id === action.payload);
      const customers = state.data.customers.filter(c => c.id !== action.payload);
      const updatedData = {
        ...state.data,
        customers,
        history: [
          {
            timestamp: new Date().toISOString(),
            action: 'Deleted',
            section: 'customers',
            details: `Customer ${customer?.name || 'Unknown'}`,
            user: 'admin',
          },
          ...state.data.history,
        ],
      };
      return { ...state, data: updatedData };
    }

    case 'ADD_HISTORY': {
      const historyEntry: HistoryEntry = {
        ...action.payload,
        timestamp: new Date().toISOString(),
        user: 'admin',
      };
      const updatedData = {
        ...state.data,
        history: [historyEntry, ...state.data.history],
      };
      return { ...state, data: updatedData };
    }

    case 'SET_RANGE': {
      const { type, start, end } = action.payload;
      let range: DateRange;
      
      if (type === 'custom' && start !== undefined && end !== undefined) {
        range = { start, end };
      } else {
        range = computeRange(type);
      }
      
      return {
        ...state,
        rangeState: {
          type,
          ...range,
        },
      };
    }

    case 'SET_WEEK_OFFSET':
      return {
        ...state,
        currentWeekOffset: action.payload,
      };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Convenience methods
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => void;
  updateSale: (id: number, updates: Partial<Sale>) => void;
  deleteSale: (id: number) => void;
  addStaff: (staff: Staff) => void;
  updateStaff: (index: number, updates: Staff) => void;
  deleteStaff: (index: number) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (index: number, updates: Customer) => void;
  deleteCustomer: (index: number) => void;
  addInventory: (item: InventoryItem) => void;
  updateInventory: (index: number, updates: InventoryItem) => void;
  deleteInventory: (index: number) => void;
  addStaffOverride: (override: Omit<StaffOverride, 'id'>) => void;
  setRange: (type: RangeType, start?: Date | null, end?: Date | null) => void;
  setWeekOffset: (offset: number) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = loadFromLocalStorage('barbershopData', initialData);
    dispatch({ type: 'LOAD_DATA', payload: savedData });
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage('barbershopData', state.data);
  }, [state.data]);

  // Convenience methods
  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    dispatch({ type: 'ADD_APPOINTMENT', payload: appointment });
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    dispatch({ type: 'UPDATE_APPOINTMENT', payload: { id, updates } });
  };

  const deleteAppointment = (id: string) => {
    dispatch({ type: 'DELETE_APPOINTMENT', payload: id });
  };

  const addSale = (sale: Omit<Sale, 'id' | 'date'>) => {
    dispatch({ type: 'ADD_SALE', payload: sale });
  };

  const updateSale = (id: number, updates: Partial<Sale>) => {
    dispatch({ type: 'UPDATE_SALE', payload: { id, updates } });
  };

  const deleteSale = (id: number) => {
    dispatch({ type: 'DELETE_SALE', payload: id });
  };

  const addStaff = (staff: Staff) => {
    dispatch({ type: 'ADD_STAFF', payload: staff });
  };

  const updateStaff = (index: number, updates: Staff) => {
    dispatch({ type: 'UPDATE_STAFF', payload: { index, updates } });
  };

  const deleteStaff = (index: number) => {
    dispatch({ type: 'DELETE_STAFF', payload: index });
  };

  const addCustomer = (customer: Customer) => {
    dispatch({ type: 'ADD_CUSTOMER', payload: customer });
  };

  const updateCustomer = (index: number, updates: Customer) => {
    dispatch({ type: 'UPDATE_CUSTOMER', payload: { index, updates } });
  };

  const deleteCustomer = (index: number) => {
    dispatch({ type: 'DELETE_CUSTOMER', payload: index });
  };

  const addInventory = (item: InventoryItem) => {
    dispatch({ type: 'ADD_INVENTORY', payload: item });
  };

  const updateInventory = (index: number, updates: InventoryItem) => {
    dispatch({ type: 'UPDATE_INVENTORY', payload: { index, updates } });
  };

  const deleteInventory = (index: number) => {
    dispatch({ type: 'DELETE_INVENTORY', payload: index });
  };

  const addStaffOverride = (override: Omit<StaffOverride, 'id'>) => {
    dispatch({ type: 'ADD_STAFF_OVERRIDE', payload: override });
  };

  const setRange = (type: RangeType, start?: Date | null, end?: Date | null) => {
    dispatch({ type: 'SET_RANGE', payload: { type, start, end } });
  };

  const setWeekOffset = (offset: number) => {
    dispatch({ type: 'SET_WEEK_OFFSET', payload: offset });
  };

  const value: AppContextType = {
    state,
    dispatch,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addSale,
    updateSale,
    deleteSale,
    addStaff,
    updateStaff,
    deleteStaff,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addInventory,
    updateInventory,
    deleteInventory,
    addStaffOverride,
    setRange,
    setWeekOffset,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

