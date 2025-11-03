import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import styles from '../pages/Staff.module.css';
import type { Staff, StaffAvailability } from '../services/barbershopApi';
import { staffAvailabilityService } from '../services/barbershopApi';

// StaffAvailability interface is now imported from barbershopApi

interface Props {
  staff: Staff[];
  onAvailabilityUpdate?: () => void;
}

const StaffAvailabilityGrid: React.FC<Props> = ({ staff, onAvailabilityUpdate }) => {
  const [viewRange, setViewRange] = useState<'week' | 'custom' | 'today'>('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availability, setAvailability] = useState<StaffAvailability[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate week dates
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay + 1); // Start from Monday
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Load availability data
  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoading(true);
        const data = await staffAvailabilityService.getAvailability();
        setAvailability(data);
      } catch (error) {
        console.error('Failed to load staff availability:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, []);

  // Get staff availability for a specific date and time slot
  const getStaffAvailabilityStatus = (staffId: number, date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Find all availability records for this staff on this date
    const staffDayRecords = availability.filter(a => 
      a.staff === staffId && 
      a.date === dateStr
    );
    
    // Look for exact time match first (individual hour records)
    const exactTimeMatch = staffDayRecords.find(a => a.start_time === time);
    
    if (exactTimeMatch) {
      console.log(`DEBUG: Found exact time match for ${staffId} at ${time}:`, exactTimeMatch);
      return exactTimeMatch.is_available ? 'available' : 'unavailable';
    }
    
    // Look for time range that includes this hour (full day records)
    const timeHour = parseInt(time.split(':')[0]);
    const withinRange = staffDayRecords.find(a => {
      if (!a.start_time || !a.end_time) return false;
      const startHour = parseInt(a.start_time.split(':')[0]);
      const endHour = parseInt(a.end_time.split(':')[0]);
      return timeHour >= startHour && timeHour < endHour;
    });
    
    if (withinRange) {
      console.log(`DEBUG: Found within range for ${staffId} at ${time}:`, withinRange);
      return withinRange.is_available ? 'available' : 'unavailable';
    }
    
    // Debug logging for troubleshooting
    if (staffDayRecords.length > 0) {
      console.log(`DEBUG: No match found for ${staffId} at ${time}. Available records:`, staffDayRecords);
    }
    
    // Default: Not set, show as unavailable during business hours
    const dayIndex = date.getDay();
    if (dayIndex >= 1 && dayIndex <= 5 && timeHour >= 9 && timeHour <= 18) {
      return 'unavailable'; // Changed from 'available' to 'unavailable' for unset hours
    }
    
    return 'off';
  };

  // Removed unused functions - using inline logic now

  const handleDayClick = async (staffId: number, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const staffMember = staff.find(s => s.id === staffId);
    
    if (!staffMember) return;
    
    // Show a simple prompt to set availability for the day
    const isAvailable = confirm(
      `Set ${staffMember.name} as available for ${date.toLocaleDateString()}?\n\n` +
      `Click OK for Available (9 AM - 6 PM)\n` +
      `Click Cancel for Unavailable`
    );
    
    try {
      // Set availability for standard business hours
      const businessHours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
      
      for (const time of businessHours) {
        const existingAvailability = availability.find(a => 
          a.staff === staffId && 
          a.date === dateStr && 
          a.start_time === time
        );
        
        if (existingAvailability) {
          // Update existing availability
          await staffAvailabilityService.updateAvailability(existingAvailability.id, {
            ...existingAvailability,
            is_available: isAvailable
          });
        } else {
          // Create new availability for this time slot
          const [hour, minute] = time.split(':');
          const endHour = (parseInt(hour) + 1).toString().padStart(2, '0');
          const endTime = `${endHour}:${minute}`;
          
          await staffAvailabilityService.createAvailability({
            staff: staffId,
            date: dateStr,
            start_time: time,
            end_time: endTime,
            is_available: isAvailable,
            notes: `Set for full day - ${isAvailable ? 'Available' : 'Unavailable'}`
          });
        }
      }
      
      // Reload availability data to ensure UI is in sync
      console.log('DEBUG: Reloading availability data after update...');
      const data = await staffAvailabilityService.getAvailability();
      console.log('DEBUG: New availability data loaded:', data);
      setAvailability(data);
      
      // Force a re-render by updating a dummy state
      setLoading(false);
      
      if (onAvailabilityUpdate) {
        onAvailabilityUpdate();
      }
      
      console.log('DEBUG: Availability update completed successfully');
    } catch (error) {
      console.error('Failed to update day availability:', error);
      alert('Failed to update availability. Please try again.');
    }
  };

  const handleHourSlotClick = async (staffId: number, date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    
    console.log('DEBUG: handleHourSlotClick called with:', { staffId, dateStr, time });
    
    // Find the specific time slot availability
    const existingAvailability = availability.find(a => 
      a.staff === staffId && 
      a.date === dateStr && 
      a.start_time === time
    );

    console.log('DEBUG: Existing availability found:', existingAvailability);

    try {
      if (existingAvailability) {
        // Toggle availability for this specific hour
        const updatedAvailability = {
          ...existingAvailability,
          is_available: !existingAvailability.is_available
        };
        console.log('DEBUG: Updating availability:', updatedAvailability);
        await staffAvailabilityService.updateAvailability(existingAvailability.id, updatedAvailability);
      } else {
        // Create new availability entry for this specific hour
        const [hour, minute] = time.split(':');
        const endHour = (parseInt(hour) + 1).toString().padStart(2, '0');
        const endTime = `${endHour}:${minute}`;
        
        const newAvailability = {
          staff: staffId,
          date: dateStr,
          start_time: time,
          end_time: endTime,
          is_available: true,
          notes: `Individual hour set: ${time}`
        };
        
        console.log('DEBUG: Creating new availability:', newAvailability);
        await staffAvailabilityService.createAvailability(newAvailability);
      }

      // Reload availability data
      console.log('DEBUG: Reloading availability data...');
      const data = await staffAvailabilityService.getAvailability();
      console.log('DEBUG: New availability data loaded:', data);
      setAvailability(data);
      console.log('DEBUG: State updated with new data');
      
      // Force a re-render by updating a counter
      setLoading(false);
      setTimeout(() => setLoading(false), 100); // Trigger state change
      
      if (onAvailabilityUpdate) {
        console.log('DEBUG: Calling onAvailabilityUpdate callback');
        onAvailabilityUpdate();
      }
    } catch (error: any) {
      console.error('Failed to update hour availability:', error);
      console.error('Error details:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      alert(`Failed to update availability: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
    }
  };

  return (
    <Card>
      <div className={styles.availabilityHeader}>
        <h3>Staff Availability</h3>
        <div className={styles.availabilityControls}>
          <Select
            value={viewRange}
            onChange={(e) => setViewRange(e.target.value as 'week' | 'custom' | 'today')}
            options={[
              { value: 'today', label: 'Today - Detailed Hours' },
              { value: 'week', label: 'This Week - Overview' },
              { value: 'custom', label: 'Custom Range' }
            ]}
          />
          {viewRange === 'custom' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={styles.dateInput}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={styles.dateInput}
              />
              <Button onClick={() => {}}>Apply</Button>
            </>
          )}
        </div>
      </div>
      
      <div className={styles.availabilitySubtitle}>
        {viewRange === 'today' 
          ? 'Click individual time slots to set availability. Barbers can have continuous or non-continuous hours.' 
          : 'Shows who is working & when (by declared schedules & overrides)'
        }
      </div>

      {viewRange === 'today' ? (
        <div className={styles.todayGrid}>
          {/* Today's Detailed View */}
          <div className={styles.todayHeader}>
            <h4>Today - {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</h4>
          </div>

          {/* Detailed Time Slots Grid */}
          <div className={styles.detailedGrid}>
            {/* Header */}
            <div className={`${styles.slot} ${styles.header}`}>Staff</div>
            {timeSlots.map(time => {
              const [hour, minute] = time.split(':');
              const displayTime = parseInt(hour) > 12 
                ? `${parseInt(hour) - 12}:${minute} PM`
                : parseInt(hour) === 12
                ? `12:${minute} PM`
                : `${parseInt(hour)}:${minute} AM`;
              return (
                <div key={time} className={`${styles.slot} ${styles.header}`}>
                  {displayTime}
                </div>
              );
            })}

            {/* Staff Rows */}
            {staff.filter(s => s.status === 'Active').map(staffMember => (
              <React.Fragment key={`today-${staffMember.id}`}>
                <div className={`${styles.slot} ${styles.staffName}`}>
                  <strong>{staffMember.name}</strong><br />
                  <small>{staffMember.role}</small>
                </div>
                
                {timeSlots.map(time => {
                  const today = new Date();
                  const status = getStaffAvailabilityStatus(staffMember.id, today, time);
                  const isAvailable = status === 'available';
                  
                  return (
                    <div
                      key={`${staffMember.id}-today-${time}`}
                      className={`${styles.slot} ${styles.timeSlot} ${
                        isAvailable ? styles.available : styles.unavailable
                      }`}
                      onClick={() => handleHourSlotClick(staffMember.id, today, time)}
                      title={`${staffMember.name} at ${time}: ${isAvailable ? 'Available' : 'Unavailable'}`}
                      style={{ cursor: 'pointer' }}
                    >
                      {isAvailable ? '✓' : '✗'}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Instructions */}
          <div className={styles.instructions}>
            <p><strong>💡 Instructions:</strong></p>
            <ul>
              <li>✓ = Available hour</li>
              <li>✗ = Unavailable hour</li>
              <li>Click any time slot to toggle availability</li>
              <li>Set continuous hours (9 AM - 5 PM) or non-continuous hours (9 AM - 12 PM, 2 PM - 6 PM)</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className={styles.scheduleGrid}>
        {/* Header row */}
        <div className={`${styles.slot} ${styles.header}`}>Staff / Time</div>
        {weekDays.map((day, index) => (
          <div key={day} className={`${styles.slot} ${styles.header}`}>
            {day}<br />
            <small>{weekDates[index]?.getDate()}/{weekDates[index]?.getMonth() + 1}</small>
          </div>
        ))}

        {/* Staff rows */}
        {staff.filter(s => s.status === 'Active').map(staffMember => (
          <React.Fragment key={staffMember.id}>
            {/* Staff name column */}
            <div className={`${styles.slot} ${styles.timeLabel}`}>
              <strong>{staffMember.name}</strong><br />
              <small>{staffMember.role}</small>
            </div>
            
            {/* Time slots for this staff member */}
            {weekDates.map((date, dayIndex) => {
              if (loading) {
                return <div key={`${staffMember.id}-${dayIndex}`} className={styles.slot}>Loading...</div>;
              }
              
              // Calculate availability summary for the day
              const dayAvailability = timeSlots.map(time => 
                getStaffAvailabilityStatus(staffMember.id, date, time)
              );
              
              const availableSlots = dayAvailability.filter(status => status === 'available').length;
              const unavailableSlots = dayAvailability.filter(status => status === 'unavailable').length;
              const offSlots = dayAvailability.filter(status => status === 'off').length;
              
              let slotClass = styles.slot;
              let slotText = '';
              
              if (availableSlots > unavailableSlots && availableSlots > offSlots) {
                slotClass += ` ${styles.available}`;
                slotText = `${availableSlots}h available`;
              } else if (unavailableSlots > 0) {
                slotClass += ` ${styles.unavailable}`;
                slotText = `${unavailableSlots}h unavailable`;
              } else {
                slotClass += ` ${styles.off}`;
                slotText = 'Off';
              }
              
              return (
                <div 
                  key={`${staffMember.id}-${dayIndex}`} 
                  className={slotClass}
                  onClick={() => handleDayClick(staffMember.id, date)}
                  title={`${staffMember.name} on ${date.toLocaleDateString()}: ${slotText}`}
                  style={{ cursor: 'pointer' }}
                >
                  {slotText}
                </div>
              );
            })}
          </React.Fragment>
        ))}
        
        {staff.filter(s => s.status === 'Active').length === 0 && (
          <div className={styles.slot} style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            No active staff members found. Add staff members first.
          </div>
        )}
        </div>
      )}

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.available}`}></div>
          <span>Available</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.booked}`}></div>
          <span>Booked</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.unavailable}`}></div>
          <span>Unavailable</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.off}`}></div>
          <span>Off</span>
        </div>
      </div>
    </Card>
  );
};

export default StaffAvailabilityGrid;