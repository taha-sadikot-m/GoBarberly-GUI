import { useState, useEffect, useCallback } from 'react';
import { salesService, type Sale } from '../services/barbershopApi';

export const useBarbershopSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchSales = useCallback(async (params?: {
    start_date?: string;
    end_date?: string;
    payment_method?: string;
    service?: string;
    page?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await salesService.getAll(params);
      setSales(data.results);
      setTotalCount(data.count);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSale = useCallback(async (saleData: Omit<Sale, 'id' | 'sale_date'>) => {
    try {
      const newSale = await salesService.create(saleData);
      setSales(prev => [newSale, ...prev]);
      setTotalCount(prev => prev + 1);
      return newSale;
    } catch (err) {
      console.error('Error creating sale:', err);
      throw err;
    }
  }, []);

  const updateSale = useCallback(async (id: number, updates: Partial<Sale>) => {
    try {
      const updatedSale = await salesService.update(id, updates);
      setSales(prev => 
        prev.map(sale => sale.id === id ? updatedSale : sale)
      );
      return updatedSale;
    } catch (err) {
      console.error('Error updating sale:', err);
      throw err;
    }
  }, []);

  const deleteSale = useCallback(async (id: number) => {
    try {
      await salesService.delete(id);
      setSales(prev => prev.filter(sale => sale.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      console.error('Error deleting sale:', err);
      throw err;
    }
  }, []);

  const quickSale = useCallback(async (data: {
    customer_name?: string;
    service: string;
    amount: number;
    payment_method?: string;
    barber_name: string;
  }) => {
    try {
      const newSale = await salesService.quickSale(data);
      setSales(prev => [newSale, ...prev]);
      setTotalCount(prev => prev + 1);
      return newSale;
    } catch (err) {
      console.error('Error creating quick sale:', err);
      throw err;
    }
  }, []);

  const getDailySummary = useCallback(async (date?: string) => {
    try {
      return await salesService.getDailySummary(date);
    } catch (err) {
      console.error('Error fetching daily summary:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Filtered sales (for date range filtering in the future)
  const filteredSales = sales; // TODO: Add date range filtering if needed

  // Calculate revenue
  const getTotalRevenue = useCallback(() => {
    return filteredSales.reduce((total, sale) => total + (sale.amount || 0), 0);
  }, [filteredSales]);

  // Get sales count
  const getSalesCount = useCallback(() => {
    return filteredSales.length;
  }, [filteredSales]);

  // Get sales by period
  const getSalesByPeriod = useCallback(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Get week start (Sunday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    
    // Get month start
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const todaySales = sales
      .filter(sale => sale.sale_date.startsWith(today))
      .reduce((sum, sale) => sum + sale.amount, 0);
    
    const weekSales = sales
      .filter(sale => new Date(sale.sale_date) >= weekStart)
      .reduce((sum, sale) => sum + sale.amount, 0);
    
    const monthSales = sales
      .filter(sale => new Date(sale.sale_date) >= monthStart)
      .reduce((sum, sale) => sum + sale.amount, 0);

    return { today: todaySales, week: weekSales, month: monthSales };
  }, [sales]);

  // Get sales by service
  const getSalesByService = useCallback(() => {
    const serviceStats: { [key: string]: { count: number; revenue: number } } = {};
    
    filteredSales.forEach(sale => {
      if (!serviceStats[sale.service]) {
        serviceStats[sale.service] = { count: 0, revenue: 0 };
      }
      serviceStats[sale.service].count++;
      serviceStats[sale.service].revenue += sale.amount;
    });

    return serviceStats;
  }, [filteredSales]);

  // Get sales by barber
  const getSalesByBarber = useCallback(() => {
    const barberStats: { [key: string]: { count: number; revenue: number } } = {};
    
    filteredSales.forEach(sale => {
      if (!barberStats[sale.barber_name]) {
        barberStats[sale.barber_name] = { count: 0, revenue: 0 };
      }
      barberStats[sale.barber_name].count++;
      barberStats[sale.barber_name].revenue += sale.amount;
    });

    return barberStats;
  }, [filteredSales]);

  // Get average ticket size
  const getAverageTicket = useCallback(() => {
    if (filteredSales.length === 0) return 0;
    return getTotalRevenue() / filteredSales.length;
  }, [filteredSales, getTotalRevenue]);

  return {
    sales: filteredSales,
    allSales: sales,
    loading,
    error,
    totalCount,
    fetchSales,
    createSale,
    updateSale,
    deleteSale,
    quickSale,
    getDailySummary,
    // Computed values
    getTotalRevenue,
    getSalesCount,
    getSalesByPeriod,
    getSalesByService,
    getSalesByBarber,
    getAverageTicket,
  };
};