import React, { useState } from 'react';
import { Button, Select, Table, Modal, Input, Card, Badge } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useServiceOptions } from '../hooks/useServiceOptions';
import { formatDate, formatTime } from '../utils';
import type { Appointment } from '../types';

const Appointments: React.FC = () => {
  const { state, addAppointment, updateAppointment, deleteAppointment } = useApp();
  const { serviceOptions } = useServiceOptions();
  const [barberFilter, setBarberFilter] = useState('ALL');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [appointmentForm, setAppointmentForm] = useState({
    customer: '',
    phone: '',
    service: '',
    barber: '',
    date: '',
    time: '',
    status: 'Confirmed' as Appointment['status']
  });

  // Get unique barbers for filter dropdown
  const barbers = Array.from(new Set(state.data.staff.map(s => s.name)));
  const barberOptions = [
    { value: 'ALL', label: 'All Barbers' },
    ...barbers.map(barber => ({ value: barber, label: barber }))
  ];



  // Time options with strict 30-minute intervals (9 AM to 8 PM)
  const generateTimeSlots = () => {
    const slots = [{ value: '', label: 'Select Time' }];
    for (let i = 0; i < 24; i++) {
      const hour = Math.floor(i / 2) + 9;
      const minute = (i % 2) * 30;
      if (hour > 20) break; // Stop at 8 PM
      
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayStr = hour > 12 
        ? `${hour - 12}:${minute.toString().padStart(2, '0')} PM`
        : hour === 12
        ? `12:${minute.toString().padStart(2, '0')} PM`
        : `${hour}:${minute.toString().padStart(2, '0')} AM`;
      
      slots.push({ value: timeStr, label: displayStr });
    }
    return slots;
  };
  
  const timeOptions = generateTimeSlots();

  const barberSelectOptions = [
    { value: '', label: 'Select Barber' },
    ...barbers.map(barber => ({ value: barber, label: barber }))
  ];

  const statusOptions = [
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Completed', label: 'Completed' }
  ];

  // Filter appointments by barber for the table
  const filteredAppointments = state.data.appointments.filter(appointment => 
    barberFilter === 'ALL' || appointment.barber === barberFilter
  );

  // Get all appointments for the schedule grid (don't filter by barber in the grid)
  const scheduleAppointments = state.data.appointments;

  // Table columns matching original HTML
  const columns = [
    { key: 'time' as const, header: 'Time' },
    { key: 'customer' as const, header: 'Customer' },
    { key: 'service' as const, header: 'Service' },
    { key: 'barber' as const, header: 'Barber' },
    { key: 'status' as const, header: 'Status' },
    { key: 'actions' as const, header: 'Actions' }
  ];

  // Format appointments for table display
  const tableData = filteredAppointments.map(appointment => ({
    id: appointment.id,
    time: `${formatDate(appointment.date)} ${formatTime(appointment.time)}`,
    customer: appointment.customer,
    service: appointment.service,
    barber: appointment.barber,
    status: (
      <Badge variant={
        appointment.status === 'Confirmed' ? 'success' :
        appointment.status === 'Pending' ? 'warn' :
        appointment.status === 'Cancelled' ? 'danger' : 'info'
      }>
        {appointment.status}
      </Badge>
    ),
    actions: (
      <div className="flex">
        <Button variant="ghost" onClick={() => handleEditAppointment(appointment)}>
          ✏️
        </Button>
        <Button variant="ghost" onClick={() => handleDeleteAppointment(appointment.id)}>
          🗑️
        </Button>
      </div>
    )
  }));

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

  // Time slots for schedule grid (9 AM to 8 PM) - ensuring consistency
  const scheduleTimeSlots = [];
  for (let i = 0; i < 24; i++) {
    const hour = Math.floor(i / 2) + 9;
    const minute = (i % 2) * 30;
    if (hour > 20) break; // Stop at 8 PM
    
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    scheduleTimeSlots.push(timeStr);
  }

  const openNewAppointmentModal = (date?: string, time?: string) => {
    setEditingAppointment(null);
    setAppointmentForm({
      customer: '',
      phone: '',
      service: '',
      barber: '',
      date: date || '',
      time: time || '',
      status: 'Confirmed'
    });
    setShowAppointmentModal(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setAppointmentForm({
      customer: appointment.customer,
      phone: appointment.phone,
      service: appointment.service,
      barber: appointment.barber,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status
    });
    setShowAppointmentModal(true);
  };

  const handleDeleteAppointment = (id: string) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      deleteAppointment(id);
    }
  };

  const handleSaveAppointment = () => {
    if (!appointmentForm.customer || !appointmentForm.phone || !appointmentForm.service || 
        !appointmentForm.barber || !appointmentForm.date || !appointmentForm.time) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingAppointment) {
      updateAppointment(editingAppointment.id, appointmentForm);
    } else {
      addAppointment(appointmentForm);
    }

    // Clear the form and close modal
    setShowAppointmentModal(false);
    setEditingAppointment(null);
    setAppointmentForm({
      customer: '',
      phone: '',
      service: '',
      barber: '',
      date: '',
      time: '',
      status: 'Confirmed'
    });
  };

  const getAppointmentForSlot = (date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduleAppointments.find(apt => 
      apt.date === dateStr && apt.time === time
    );
  };

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
          data={tableData}
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
          {scheduleTimeSlots.map(time => {
            // Convert 24-hour format to 12-hour format for display
            const [hour, minute] = time.split(':').map(Number);
            const displayTime = hour > 12 
              ? `${hour - 12}:${minute.toString().padStart(2, '0')} PM`
              : hour === 12
              ? `12:${minute.toString().padStart(2, '0')} PM`
              : `${hour}:${minute.toString().padStart(2, '0')} AM`;
              
            return (
            <React.Fragment key={`row-${time}`}>
              <div className="slot">
                {displayTime}
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
                      title={`${appointment.service} - ${appointment.customer}`}
                    >
                      {appointment.barber} • {appointment.customer}
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
            );
          })}
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
            Customer
            <Input
              value={appointmentForm.customer}
              onChange={(e) => setAppointmentForm(prev => ({ ...prev, customer: e.target.value }))}
              required
            />
          </label>
          <label>
            Phone
            <Input
              value={appointmentForm.phone}
              onChange={(e) => setAppointmentForm(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Service
            <Select
              value={appointmentForm.service}
              onChange={(e) => setAppointmentForm(prev => ({ ...prev, service: e.target.value }))}
              options={serviceOptions}
              required
            />
          </label>
          <label>
            Barber
            <Select
              value={appointmentForm.barber}
              onChange={(e) => setAppointmentForm(prev => ({ ...prev, barber: e.target.value }))}
              options={barberSelectOptions}
              required
            />
          </label>
          <label>
            Date
            <Input
              type="date"
              value={appointmentForm.date}
              onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </label>
          <label>
            Time
            <Select
              value={appointmentForm.time}
              onChange={(e) => setAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
              options={timeOptions}
              required
            />
          </label>
          {editingAppointment && (
            <label style={{ gridColumn: '1 / -1' }}>
              Status
              <Select
                value={appointmentForm.status}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, status: e.target.value as Appointment['status'] }))}
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

export default Appointments;