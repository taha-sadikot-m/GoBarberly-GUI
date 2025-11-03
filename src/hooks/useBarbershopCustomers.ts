import { useState, useEffect, useCallback } from 'react';
import { customerService, type Customer } from '../services/barbershopApi';

export const useBarbershopCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCustomers = useCallback(async (params?: {
    search?: string;
    page?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerService.getAll(params);
      setCustomers(data.results);
      setTotalCount(data.count);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'total_visits' | 'total_spent' | 'last_visit_date'>) => {
    try {
      const newCustomer = await customerService.create(customerData);
      setCustomers(prev => [newCustomer, ...prev]);
      setTotalCount(prev => prev + 1);
      return newCustomer;
    } catch (err) {
      console.error('Error creating customer:', err);
      throw err;
    }
  }, []);

  const updateCustomer = useCallback(async (id: number, updates: Partial<Customer>) => {
    try {
      const updatedCustomer = await customerService.update(id, updates);
      setCustomers(prev => 
        prev.map(customer => customer.id === id ? updatedCustomer : customer)
      );
      return updatedCustomer;
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  }, []);

  const deleteCustomer = useCallback(async (id: number) => {
    try {
      await customerService.delete(id);
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      console.error('Error deleting customer:', err);
      throw err;
    }
  }, []);

  const updateCustomerStats = useCallback(async (id: number) => {
    try {
      const updatedCustomer = await customerService.updateStats(id);
      setCustomers(prev => 
        prev.map(customer => customer.id === id ? updatedCustomer : customer)
      );
      return updatedCustomer;
    } catch (err) {
      console.error('Error updating customer stats:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Search functionality
  const searchCustomers = useCallback((query: string) => {
    fetchCustomers({ search: query });
  }, [fetchCustomers]);

  // Computed values
  const getTopCustomers = useCallback((limit: number = 10) => {
    return [...customers]
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, limit);
  }, [customers]);

  const getFrequentCustomers = useCallback((limit: number = 10) => {
    return [...customers]
      .sort((a, b) => b.total_visits - a.total_visits)
      .slice(0, limit);
  }, [customers]);

  const getRecentCustomers = useCallback((limit: number = 10) => {
    return [...customers]
      .sort((a, b) => new Date(b.last_visit_date).getTime() - new Date(a.last_visit_date).getTime())
      .slice(0, limit);
  }, [customers]);

  const getTotalRevenue = useCallback(() => {
    return customers.reduce((total, customer) => total + customer.total_spent, 0);
  }, [customers]);

  const getAverageSpendPerCustomer = useCallback(() => {
    if (customers.length === 0) return 0;
    return getTotalRevenue() / customers.length;
  }, [customers, getTotalRevenue]);

  const getCustomersByVisitRange = useCallback((minVisits: number, maxVisits?: number) => {
    return customers.filter(customer => {
      if (maxVisits !== undefined) {
        return customer.total_visits >= minVisits && customer.total_visits <= maxVisits;
      }
      return customer.total_visits >= minVisits;
    });
  }, [customers]);

  return {
    customers,
    loading,
    error,
    totalCount,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerStats,
    searchCustomers,
    // Computed values
    getTopCustomers,
    getFrequentCustomers,
    getRecentCustomers,
    getTotalRevenue,
    getAverageSpendPerCustomer,
    getCustomersByVisitRange,
  };
};