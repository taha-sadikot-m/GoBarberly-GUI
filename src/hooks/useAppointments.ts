import { useApp } from '../context/AppContext';
import { inRange } from '../utils';
import type { Appointment } from '../types';

export const useAppointments = () => {
  const { state, addAppointment, updateAppointment, deleteAppointment } = useApp();

  // Filter appointments by date range
  const filteredAppointments = state.data.appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date + 'T' + appointment.time);
    return inRange(appointmentDate, state.rangeState.start, state.rangeState.end);
  });

  // Get appointments by barber
  const getAppointmentsByBarber = (barber: string) => {
    return filteredAppointments.filter(appointment => 
      barber === 'ALL' ? true : appointment.barber === barber
    );
  };

  // Get appointments by status
  const getAppointmentsByStatus = (status: Appointment['status']) => {
    return filteredAppointments.filter(appointment => appointment.status === status);
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: string) => {
    return state.data.appointments.filter(appointment => appointment.date === date);
  };

  // Get appointments stats
  const getAppointmentStats = () => {
    const total = filteredAppointments.length;
    const completed = getAppointmentsByStatus('Completed').length;
    const confirmed = getAppointmentsByStatus('Confirmed').length;
    const pending = getAppointmentsByStatus('Pending').length;
    const cancelled = getAppointmentsByStatus('Cancelled').length;

    return { total, completed, confirmed, pending, cancelled };
  };

  // Complete appointment
  const completeAppointment = (id: string) => {
    updateAppointment(id, { status: 'Completed' });
  };

  // Cancel appointment
  const cancelAppointment = (id: string) => {
    updateAppointment(id, { status: 'Cancelled' });
  };

  return {
    appointments: filteredAppointments,
    allAppointments: state.data.appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    completeAppointment,
    cancelAppointment,
    getAppointmentsByBarber,
    getAppointmentsByStatus,
    getAppointmentsForDate,
    getAppointmentStats,
  };
};