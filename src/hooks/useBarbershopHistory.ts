import { useState, useEffect, useCallback } from 'react';
import { activityService, type ActivityLog } from '../services/barbershopApi';

export const useBarbershopHistory = () => {
  const [history, setHistory] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchHistory = useCallback(async (params?: {
    action_type?: string;
    start_date?: string;
    page?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await activityService.getAll(params);
      setHistory(data.results);
      setTotalCount(data.count);
    } catch (err) {
      console.error('Error fetching activity history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activity history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Filter functions
  const filterByActionType = useCallback((actionType: string) => {
    fetchHistory({ action_type: actionType });
  }, [fetchHistory]);

  const filterByDateRange = useCallback((startDate: string) => {
    fetchHistory({ start_date: startDate });
  }, [fetchHistory]);

  const filterByPeriod = useCallback((period: 'today' | 'week' | 'month') => {
    const now = new Date();
    let startDate: string;

    switch (period) {
      case 'today':
        startDate = now.toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      default:
        startDate = now.toISOString().split('T')[0];
    }

    fetchHistory({ start_date: startDate });
  }, [fetchHistory]);

  // Computed values
  const getHistoryByActionType = useCallback((actionType: string) => {
    return history.filter(log => log.action_type === actionType);
  }, [history]);

  const getRecentHistory = useCallback((limit: number = 10) => {
    return history.slice(0, limit);
  }, [history]);

  const getHistoryStats = useCallback(() => {
    const actionTypes = history.reduce((acc, log) => {
      acc[log.action_type] = (acc[log.action_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const today = new Date().toISOString().split('T')[0];
    const todayLogs = history.filter(log => log.created_at.startsWith(today));

    return {
      totalLogs: history.length,
      todayLogs: todayLogs.length,
      actionTypes,
      mostFrequentAction: Object.entries(actionTypes).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
    };
  }, [history]);

  const searchHistory = useCallback((query: string) => {
    return history.filter(log => 
      log.description.toLowerCase().includes(query.toLowerCase()) ||
      log.action_type.toLowerCase().includes(query.toLowerCase())
    );
  }, [history]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refresh = useCallback(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    totalCount,
    fetchHistory,
    filterByActionType,
    filterByDateRange,
    filterByPeriod,
    // Computed values and utilities
    getHistoryByActionType,
    getRecentHistory,
    getHistoryStats,
    searchHistory,
    clearError,
    refresh,
  };
};