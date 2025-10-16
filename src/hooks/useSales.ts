import { useApp } from '../context/AppContext';
import { inRange } from '../utils';

export const useSales = () => {
  const { state, addSale, updateSale, deleteSale } = useApp();

  // Filter sales by date range
  const filteredSales = state.data.sales.filter(sale => 
    inRange(new Date(sale.date), state.rangeState.start, state.rangeState.end)
  );

  // Calculate revenue
  const getTotalRevenue = () => {
    return filteredSales.reduce((total, sale) => total + (sale.amount || 0), 0);
  };

  // Get sales count
  const getSalesCount = () => {
    return filteredSales.length;
  };

  // Get sales by period
  const getSalesByPeriod = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Get week start (Sunday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    
    // Get month start
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const todaySales = state.data.sales
      .filter(sale => sale.date.startsWith(today))
      .reduce((sum, sale) => sum + sale.amount, 0);
    
    const weekSales = state.data.sales
      .filter(sale => new Date(sale.date) >= weekStart)
      .reduce((sum, sale) => sum + sale.amount, 0);
    
    const monthSales = state.data.sales
      .filter(sale => new Date(sale.date) >= monthStart)
      .reduce((sum, sale) => sum + sale.amount, 0);

    return { today: todaySales, week: weekSales, month: monthSales };
  };

  // Get sales by service
  const getSalesByService = () => {
    const serviceStats: { [key: string]: { count: number; revenue: number } } = {};
    
    filteredSales.forEach(sale => {
      if (!serviceStats[sale.service]) {
        serviceStats[sale.service] = { count: 0, revenue: 0 };
      }
      serviceStats[sale.service].count++;
      serviceStats[sale.service].revenue += sale.amount;
    });

    return serviceStats;
  };

  // Get sales by barber
  const getSalesByBarber = () => {
    const barberStats: { [key: string]: { count: number; revenue: number } } = {};
    
    filteredSales.forEach(sale => {
      if (!barberStats[sale.barber]) {
        barberStats[sale.barber] = { count: 0, revenue: 0 };
      }
      barberStats[sale.barber].count++;
      barberStats[sale.barber].revenue += sale.amount;
    });

    return barberStats;
  };

  // Get average ticket size
  const getAverageTicket = () => {
    if (filteredSales.length === 0) return 0;
    return getTotalRevenue() / filteredSales.length;
  };

  return {
    sales: filteredSales,
    allSales: state.data.sales,
    addSale,
    updateSale,
    deleteSale,
    getTotalRevenue,
    getSalesCount,
    getSalesByPeriod,
    getSalesByService,
    getSalesByBarber,
    getAverageTicket,
  };
};