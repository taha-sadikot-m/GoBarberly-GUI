import { useState, useCallback, useEffect } from 'react';
import { BarbershopService as BarbershopAPI } from '../services/api';
import type { BarbershopService, CreateServiceData, UpdateServiceData } from '../types';

export const useBarbershopServices = () => {
  const [services, setServices] = useState<BarbershopService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await BarbershopAPI.getServices();
      if (response.success && response.data) {
        setServices(response.data);
      } else {
        setError(response.message || 'Failed to fetch services');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch services';
      setError(errorMessage);
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = useCallback(async (serviceData: CreateServiceData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await BarbershopAPI.createService(serviceData);
      if (response.success && response.data) {
        setServices(prev => [response.data, ...prev]);
        return response.data;
      } else {
        const errorMessage = response.message || 'Failed to create service';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create service';
      setError(errorMessage);
      console.error('Failed to create service:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateService = useCallback(async (id: number, serviceData: UpdateServiceData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await BarbershopAPI.updateService(id, serviceData);
      if (response.success && response.data) {
        setServices(prev => prev.map(service => 
          service.id === id ? response.data : service
        ));
        return response.data;
      } else {
        const errorMessage = response.message || 'Failed to update service';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update service';
      setError(errorMessage);
      console.error('Failed to update service:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteService = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await BarbershopAPI.deleteService(id);
      if (response.success) {
        setServices(prev => prev.filter(service => service.id !== id));
      } else {
        const errorMessage = response.message || 'Failed to delete service';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete service';
      setError(errorMessage);
      console.error('Failed to delete service:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getActiveServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await BarbershopAPI.getActiveServices();
      if (response.success && response.data) {
        return response.data;
      } else {
        const errorMessage = response.message || 'Failed to fetch active services';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch active services';
      setError(errorMessage);
      console.error('Failed to fetch active services:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch services on mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    getActiveServices,
  };
};