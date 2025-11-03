import React, { useState } from 'react';
import { Button, Select, Table, Modal, Input, Card, Badge } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useBarbershopAppointments } from '../hooks/useBarbershopAppointments';
import { useBarbershopStaff } from '../hooks/useBarbershopStaff';
import { useServiceOptions } from '../hooks/useServiceOptions';
import { formatDate, formatTime } from '../utils';
import type { Appointment } from '../services/barbershopApi';

const BarbershopAppointments: React.FC = () => {
  const {
    appointments: apiAppointments,
    loading,
    error,
    createAppointment,
    updateAppointmentStatus,
    deleteAppointment,
  } = useBarbershopAppointments();
  
  // 🆘 FALLBACK MECHANISM: Use local appointments when API fails
  const { state: appState } = useApp();
  const localAppointments = appState.data.appointments || [];
  
  // Use API appointments if available, otherwise fallback to local
  const appointments = (apiAppointments && apiAppointments.length > 0) ? apiAppointments : localAppointments.map(apt => ({
    id: apt.id,
    customer_name: apt.customer,
    customer_phone: apt.phone || '',
    service: apt.service, // API type uses 'service' not 'service_name'
    barber_name: apt.barber, // Local type uses 'barber' not 'staff'
    appointment_date: apt.date,
    appointment_time: apt.time,
    status: (apt.status?.toLowerCase() || 'pending') as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show',
    duration_minutes: 60, // default duration
    notes: '' // default notes
  }));

  const { staff } = useBarbershopStaff();
  const { serviceOptions, getServicePrice } = useServiceOptions();

  // 🚨 CRITICAL DEBUGGING STATEMENTS
  console.log('🔍 BarbershopAppointments - Debug Info:');
  console.log('📊 API Appointments:', apiAppointments);
  console.log('📊 Local Appointments:', localAppointments);  
  console.log('📊 Final Appointments data:', appointments);
  console.log('📊 Appointments count:', appointments?.length || 0);
  console.log('⏳ Loading state:', loading);
  console.log('❌ Error state:', error);
  console.log('👥 Staff data:', staff);
  console.log('👥 Staff count:', staff?.length || 0);

  const [barberFilter, setBarberFilter] = useState('ALL');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [appointmentForm, setAppointmentForm] = useState({
    customer_name: '',
    customer_phone: '',
    service: '',
    barber_name: '',
    appointment_date: '',
    appointment_time: '',
    amount: 0,
    status: 'confirmed' as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  });

  // Handle service selection with price auto-population
  const handleServiceChange = (serviceName: string) => {
    const price = getServicePrice(serviceName);
    setAppointmentForm(prev => ({ 
      ...prev, 
      service: serviceName,
      amount: price
    }));
  };

  // Get active barbers from staff data
  const activeBarbers = staff.filter(member => 
    member.status === 'Active' && 
    (member.role.toLowerCase().includes('barber') || member.is_barber)
  );
  
  // Get unique barbers for filter dropdown (combine staff data with existing appointment barbers)
  const existingBarbers = Array.from(new Set(appointments.map(a => a.barber_name).filter(Boolean)));
  const staffBarberNames = activeBarbers.map(barber => barber.name);
  const allBarbers = Array.from(new Set([...staffBarberNames, ...existingBarbers]));
  
  const barberOptions = [
    { value: 'ALL', label: 'All Barbers' },
    ...allBarbers.map(barber => ({ value: barber, label: barber }))
  ];

  // Service options now come from database via useServiceOptions hook

  const barberSelectOptions = [
    { value: '', label: 'Select Barber' },
    ...allBarbers.map(barber => ({ value: barber, label: barber }))
  ];

  const statusOptions = [
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' },
    { value: 'no_show', label: 'No Show' }
  ];

  // Filter appointments by barber - handle case variations and 'All' option
  const filteredAppointments = appointments.filter(appointment => {
    const isShowingAll = barberFilter === 'ALL' || barberFilter === 'All' || barberFilter.toLowerCase() === 'all';
    return isShowingAll || appointment.barber_name === barberFilter;
  });
  
  // 🔍 FILTERED APPOINTMENTS DEBUG
  console.log('🎯 Filtered appointments:', filteredAppointments);
  console.log('🎯 Filtered appointments count:', filteredAppointments.length);
  console.log('🎯 Barber filter:', barberFilter);
  console.log('🎯 Filter condition results:', appointments.map(apt => ({
    appointment: apt.customer_name,
    barber: apt.barber_name,
    filterMatch: barberFilter === 'ALL' || barberFilter === 'All' || apt.barber_name === barberFilter
  })));

  // Table columns with proper render functions
  const columns = [
    { 
      key: 'appointment_date' as const, 
      header: 'Time',
      render: (_: string, appointment: Appointment) => 
        `${formatDate(appointment.appointment_date)} ${formatTime(appointment.appointment_time)}`
    },
    { 
      key: 'customer_name' as const, 
      header: 'Customer',
      render: (value: string) => value
    },
    { 
      key: 'service' as const, 
      header: 'Service',
      render: (value: string) => value
    },
    { 
      key: 'barber_name' as const, 
      header: 'Barber',
      render: (value: string) => value
    },
    { 
      key: 'status' as const, 
      header: 'Status',
      render: (value: string) => (
        <Badge variant={
          value === 'confirmed' ? 'success' :
          value === 'pending' ? 'warn' :
          value === 'cancelled' ? 'danger' : 'info'
        }>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    { 
      key: 'id' as const, 
      header: 'Actions',
      render: (_: string, appointment: Appointment) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" onClick={() => handleEditAppointment(appointment)}>
            ✏️
          </Button>
          <Button variant="ghost" onClick={() => handleDeleteAppointment(appointment.id)}>
            🗑️
          </Button>
        </div>
      )
    }
  ];

  // Get current week dates for schedule grid
  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentWeek = new Date(today);
    currentWeek.setDate(today.getDate() + (weekOffset * 7));
    
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay());
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getCurrentWeekDates();
  const weekDisplay = `${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}`;
  
  // 🗓️ WEEK DEBUG
  console.log('📅 Current week dates:', weekDates.map(d => d.toISOString().split('T')[0]));
  console.log('📅 Week offset:', weekOffset);
  console.log('📅 Today:', new Date().toISOString().split('T')[0]);
  console.log('📅 Week display:', weekDisplay);

  // Time slots for schedule grid (9 AM to 8 PM)
  const timeSlots = [];
  for (let hour = 9; hour <= 20; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 20) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  const openNewAppointmentModal = (date?: string, time?: string) => {
    setEditingAppointment(null);
    setAppointmentForm({
      customer_name: '',
      customer_phone: '',
      service: '',
      barber_name: '',
      appointment_date: date || '',
      appointment_time: time || '',
      amount: 0,
      status: 'confirmed'
    });
    setShowAppointmentModal(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setAppointmentForm({
      customer_name: appointment.customer_name,
      customer_phone: appointment.customer_phone || '',
      service: appointment.service,
      barber_name: appointment.barber_name,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      amount: appointment.amount || getServicePrice(appointment.service),
      status: appointment.status
    });
    setShowAppointmentModal(true);
  };

  const handleDeleteAppointment = (id: string) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      deleteAppointment(id);
    }
  };

  const handleSaveAppointment = async () => {
    if (!appointmentForm.customer_name || !appointmentForm.customer_phone || !appointmentForm.service || 
        !appointmentForm.barber_name || !appointmentForm.appointment_date || !appointmentForm.appointment_time) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingAppointment) {
        await updateAppointmentStatus(editingAppointment.id, appointmentForm.status);
      } else {
        await createAppointment(appointmentForm);
      }

      setShowAppointmentModal(false);
      setEditingAppointment(null);
      
      // Reset form
      setAppointmentForm({
        customer_name: '',
        customer_phone: '',
        service: '',
        barber_name: '',
        appointment_date: '',
        appointment_time: '',
        amount: 0,
        status: 'confirmed'
      });
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Failed to save appointment. Please try again.');
    }
  };

  const getAppointmentForSlot = (date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // 🔧 FIX: Handle time formats - appointment_time might be "17:00:00" while slot time is "17:00"
    const foundAppointment = filteredAppointments.find(apt => {
      const aptTime = apt.appointment_time.substring(0, 5); // Extract "17:00" from "17:00:00"
      const dateMatch = apt.appointment_date === dateStr;
      const timeMatch = aptTime === time;
      
      // 🚨 ENHANCED SLOT DEBUG
      console.log(`⏰ Time slot check for ${dateStr} ${time}:`, {
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        appointmentTimeNormalized: aptTime,
        slotTime: time,
        dateMatch,
        timeMatch,
        overallMatch: dateMatch && timeMatch
      });
      
      return dateMatch && timeMatch;
    });
    
    if (foundAppointment) {
      console.log(`✅ Found appointment for slot ${dateStr} ${time}:`, foundAppointment);
    }
    
    return foundAppointment;
  };

  if (loading) return <div>Loading appointments...</div>;
  if (error) return <div>Error loading appointments: {error}</div>;

  return (
    <>
      {/* Appointments Table Section - exactly matching original HTML */}
      <div className="table">
        <div className="between" style={{ padding: '1rem', borderBottom: '1px solid var(--slate-200)' }}>
          <h3 style={{ margin: 0 }}>Appointment Management</h3>
          <div className="flex">
            <label className="kicker">Show</label>
            <Select
              id="barberFilter"
              value={barberFilter}
              onChange={(e) => setBarberFilter(e.target.value)}
              options={barberOptions}
            />
            <Button variant="primary" onClick={() => openNewAppointmentModal()}>
              + New Appointment
            </Button>
          </div>
        </div>
        <Table
          columns={columns}
          data={filteredAppointments}
        />
      </div>

      {/* Weekly Schedule Section - exactly matching original HTML */}
      <Card style={{ marginTop: '1rem' }}>
        <div className="between">
          <h3 style={{ margin: 0 }}>Weekly Schedule</h3>
          <div className="flex">
            <div className="kicker">Week:</div>
            <Button className="btn week" onClick={() => setWeekOffset(weekOffset - 1)}>
              ← Prev
            </Button>
            <div className="pill" id="currentWeekDisplay">{weekDisplay}</div>
            <Button className="btn week" onClick={() => setWeekOffset(weekOffset + 1)}>
              Next →
            </Button>
          </div>
        </div>
        
        {/* Schedule Grid */}
        <div className="schedule-grid" id="scheduleGrid">
          {/* Header row */}
          <div className="slot header">Time</div>
          {weekDates.map((date, index) => (
            <div key={`header-${index}`} className="slot header">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
              <br />
              {date.getDate()}/{date.getMonth() + 1}
            </div>
          ))}
          
          {/* Time slots */}
          {timeSlots.map(time => (
            <React.Fragment key={`row-${time}`}>
              <div className="slot">
                {time}
              </div>
              {weekDates.map((date, dayIndex) => {
                const appointment = getAppointmentForSlot(date, time);
                const dateStr = date.toISOString().split('T')[0];
                
                if (appointment) {
                  return (
                    <div 
                      key={`slot-${dateStr}-${time}-${dayIndex}`} 
                      className="slot booked" 
                      onClick={() => handleEditAppointment(appointment)}
                      title={appointment.service}
                    >
                      {appointment.barber_name} • {appointment.customer_name}
                    </div>
                  );
                } else {
                  return (
                    <div 
                      key={`slot-${dateStr}-${time}-${dayIndex}`} 
                      className="slot available" 
                      onClick={() => openNewAppointmentModal(dateStr, time)}
                    >
                      Available
                    </div>
                  );
                }
              })}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Appointment Modal - exactly matching original HTML */}
      <Modal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        title={editingAppointment ? 'Edit Appointment' : 'New Appointment'}
      >
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <label>
            Customer Name
            <Input
              value={appointmentForm.customer_name}
              onChange={(e) => setAppointmentForm(prev => ({ ...prev, customer_name: e.target.value }))}
              required
              placeholder="Enter customer name"
            />
          </label>
          <label>
            Phone Number
            <Input
              value={appointmentForm.customer_phone}
              onChange={(e) => setAppointmentForm(prev => ({ ...prev, customer_phone: e.target.value }))}
              required
              placeholder="Enter phone number"
            />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Service
            <Select
              value={appointmentForm.service}
              onChange={(e) => handleServiceChange(e.target.value)}
              options={serviceOptions}
              required
            />
          </label>
          <label>
            Amount (₹)
            <Input
              type="number"
              value={appointmentForm.amount.toString()}
              onChange={(e) => setAppointmentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              step="1"
              required
            />
          </label>
          <label>
            Barber
            <Select
              value={appointmentForm.barber_name}
              onChange={(e) => setAppointmentForm(prev => ({ ...prev, barber_name: e.target.value }))}
              options={barberSelectOptions}
              required
            />
          </label>
          <label>
            Date
            <Input
              type="date"
              value={appointmentForm.appointment_date}
              onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointment_date: e.target.value }))}
              required
            />
          </label>
          <label>
            Time
            <Select
              value={appointmentForm.appointment_time}
              onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointment_time: e.target.value }))}
              options={[
                { value: '', label: 'Select Time' },
                ...timeSlots.map(time => ({ value: time, label: time }))
              ]}
              required
            />
          </label>
          {editingAppointment && (
            <label style={{ gridColumn: '1 / -1' }}>
              Status
              <Select
                value={appointmentForm.status}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, status: e.target.value as any }))}
                options={statusOptions}
              />
            </label>
          )}
        </div>
        <div className="between" style={{ marginTop: '1rem' }}>
          <div></div>
          <Button variant="primary" onClick={handleSaveAppointment}>
            Save Appointment
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default BarbershopAppointments;