import { useState, useCallback } from 'react';
import { reportsService } from '../services/barbershopApi';

export const useBarbershopReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReportsSummary = useCallback(async (params?: {
    start_date?: string;
    end_date?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.getSummary(params);
      return data;
    } catch (err) {
      console.error('Error fetching reports summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reports summary');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBusinessAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.getAnalytics();
      return data;
    } catch (err) {
      console.error('Error fetching business analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch business analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportData = useCallback(async (params?: {
    type?: 'all' | 'appointments' | 'sales' | 'customers' | 'inventory';
    start_date?: string;
    end_date?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.exportData(params);
      return data;
    } catch (err) {
      console.error('Error exporting data:', err);
      setError(err instanceof Error ? err.message : 'Failed to export data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper functions for date ranges
  const getDateRange = useCallback((period: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today':
        return {
          start_date: today.toISOString().split('T')[0],
          end_date: today.toISOString().split('T')[0]
        };
      
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return {
          start_date: weekStart.toISOString().split('T')[0],
          end_date: weekEnd.toISOString().split('T')[0]
        };
      
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          start_date: monthStart.toISOString().split('T')[0],
          end_date: monthEnd.toISOString().split('T')[0]
        };
      
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
        return {
          start_date: quarterStart.toISOString().split('T')[0],
          end_date: quarterEnd.toISOString().split('T')[0]
        };
      
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        return {
          start_date: yearStart.toISOString().split('T')[0],
          end_date: yearEnd.toISOString().split('T')[0]
        };
      
      default:
        return {
          start_date: today.toISOString().split('T')[0],
          end_date: today.toISOString().split('T')[0]
        };
    }
  }, []);

  const generateReport = useCallback(async (
    period: 'today' | 'week' | 'month' | 'quarter' | 'year',
    customDateRange?: { start_date: string; end_date: string }
  ) => {
    const dateRange = customDateRange || getDateRange(period);
    return await getReportsSummary(dateRange);
  }, [getDateRange, getReportsSummary]);

  const downloadReport = useCallback(async (
    type: 'all' | 'appointments' | 'sales' | 'customers' | 'inventory',
    period: 'today' | 'week' | 'month' | 'quarter' | 'year',
    customDateRange?: { start_date: string; end_date: string }
  ) => {
    const dateRange = customDateRange || getDateRange(period);
    const data = await exportData({ type, ...dateRange });
    
    // Create and download file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `barbershop-${type}-report-${dateRange.start_date}-to-${dateRange.end_date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return data;
  }, [getDateRange, exportData]);

  return {
    loading,
    error,
    getReportsSummary,
    getBusinessAnalytics,
    exportData,
    generateReport,
    downloadReport,
    getDateRange,
  };
};