import { useApp } from '../context/AppContext';
import { isWorkingDay } from '../utils';

export const useStaff = () => {
  const { state, addStaff, updateStaff, deleteStaff, addStaffOverride } = useApp();

  // Get barbers only
  const getBarbers = () => {
    return state.data.staff.filter(staff => 
      /barber/i.test(staff.role)
    );
  };

  // Get staff availability for a specific date and barber
  const getStaffAvailability = (barberName: string, date: string) => {
    const staff = state.data.staff.find(s => s.name === barberName);
    if (!staff) return null;

    // Check for specific override for this date
    const override = state.data.staffOverrides.find(
      o => o.name === barberName && o.date === date
    );

    if (override) {
      return {
        start: override.start,
        end: override.end,
        isOverride: true,
      };
    }

    // Check regular schedule
    const dateObj = new Date(date);
    const dayAbbrev = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const workingDay = isWorkingDay(staff.schedule, dayAbbrev);

    if (workingDay) {
      return {
        start: `${workingDay.start.h.toString().padStart(2, '0')}:${workingDay.start.m.toString().padStart(2, '0')}`,
        end: `${workingDay.end.h.toString().padStart(2, '0')}:${workingDay.end.m.toString().padStart(2, '0')}`,
        isOverride: false,
      };
    }

    return null;
  };

  // Get all staff availability for a date range
  const getStaffAvailabilityForRange = (startDate: Date, endDate: Date) => {
    const dates: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const availability: { [key: string]: { [key: string]: any } } = {};

    state.data.staff.forEach(staff => {
      availability[staff.name] = {};
      
      dates.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        const avail = getStaffAvailability(staff.name, dateStr);
        availability[staff.name][dateStr] = avail;
      });
    });

    return { dates, availability };
  };

  // Check if a barber is available at a specific time
  const isBarberAvailable = (barberName: string, date: string, time: string) => {
    const availability = getStaffAvailability(barberName, date);
    if (!availability) return false;

    const [hour, minute] = time.split(':').map(Number);
    const timeMinutes = hour * 60 + minute;

    const [startHour, startMinute] = availability.start.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = availability.end.split(':').map(Number);
    const endMinutes = endHour * 60 + endMinute;

    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  };

  return {
    staff: state.data.staff,
    staffOverrides: state.data.staffOverrides,
    addStaff,
    updateStaff,
    deleteStaff,
    addStaffOverride,
    getBarbers,
    getStaffAvailability,
    getStaffAvailabilityForRange,
    isBarberAvailable,
  };
};