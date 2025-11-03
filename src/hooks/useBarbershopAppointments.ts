import { useState, useEffect, useCallback } from 'react';
import { appointmentService, type Appointment } from '../services/barbershopApi';

export const useBarbershopAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAppointments = useCallback(async (params?: {
    date?: string;
    status?: string;
    barber?: string;
    page?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentService.getAll(params);
      setAppointments(data.results);
      setTotalCount(data.count);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTodayAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getTodayAppointments();
      setAppointments(data);
      setTotalCount(data.length);
    } catch (err) {
      console.error('Error fetching today appointments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch today appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      const newAppointment = await appointmentService.create(appointmentData);
      setAppointments(prev => [newAppointment, ...prev]);
      setTotalCount(prev => prev + 1);
      return newAppointment;
    } catch (err) {
      console.error('Error creating appointment:', err);
      throw err;
    }
  }, []);

  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {
    try {
      const updatedAppointment = await appointmentService.update(id, updates);
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? updatedAppointment : apt)
      );
      return updatedAppointment;
    } catch (err) {
      console.error('Error updating appointment:', err);
      throw err;
    }
  }, []);

  const updateAppointmentStatus = useCallback(async (id: string, status: string) => {
    try {
      const updatedAppointment = await appointmentService.updateStatus(id, status);
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? updatedAppointment : apt)
      );
      return updatedAppointment;
    } catch (err) {
      console.error('Error updating appointment status:', err);
      throw err;
    }
  }, []);

  const deleteAppointment = useCallback(async (id: string) => {
    try {
      await appointmentService.delete(id);
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      console.error('Error deleting appointment:', err);
      throw err;
    }
  }, []);

  const quickAppointment = useCallback(async (data: {
    customer_name?: string;
    customer_phone?: string;
    service: string;
    barber_name: string;
  }) => {
    try {
      const newAppointment = await appointmentService.quickAppointment(data);
      setAppointments(prev => [newAppointment, ...prev]);
      setTotalCount(prev => prev + 1);
      return newAppointment;
    } catch (err) {
      console.error('Error creating quick appointment:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Stats calculations
  const getAppointmentStats = useCallback(() => {
    const total = appointments.length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const confirmed = appointments.filter(apt => apt.status === 'confirmed').length;
    const pending = appointments.filter(apt => apt.status === 'pending').length;
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;

    return { total, completed, confirmed, pending, cancelled };
  }, [appointments]);

  const getAppointmentsByStatus = useCallback((status: Appointment['status']) => {
    return appointments.filter(appointment => appointment.status === status);
  }, [appointments]);

  const getAppointmentsByBarber = useCallback((barber: string) => {
    return appointments.filter(appointment => 
      barber === 'ALL' ? true : appointment.barber_name === barber
    );
  }, [appointments]);

  const getAppointmentsForDate = useCallback((date: string) => {
    return appointments.filter(appointment => appointment.appointment_date === date);
  }, [appointments]);

  return {
    appointments,
    loading,
    error,
    totalCount,
    fetchAppointments,
    fetchTodayAppointments,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    quickAppointment,
    // Computed values and filters
    getAppointmentStats,
    getAppointmentsByStatus,
    getAppointmentsByBarber,
    getAppointmentsForDate,
  };
};