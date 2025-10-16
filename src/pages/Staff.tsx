import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import styles from './Staff.module.css';
import type { Staff as StaffMember } from '../types';

const Roles: ('Barber' | 'Senior Barber' | 'Manager' | 'Receptionist')[] = [
  'Barber', 'Senior Barber', 'Manager', 'Receptionist'
];

// Hook to detect screen size for responsive grid columns
const useResponsiveGridWidth = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 860);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  return isMobile;
};

const DaysOfWeek = [
  { value: 'Mon', label: 'Mon' },
  { value: 'Tue', label: 'Tue' },
  { value: 'Wed', label: 'Wed' },
  { value: 'Thu', label: 'Thu' },
  { value: 'Fri', label: 'Fri' },
  { value: 'Sat', label: 'Sat' },
  { value: 'Sun', label: 'Sun' }
];

const Staff: React.FC = () => {
  const { state, dispatch } = useApp();
  const isMobile = useResponsiveGridWidth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [availabilityRange, setAvailabilityRange] = useState('week');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customRangeStart, setCustomRangeStart] = useState('');
  const [customRangeEnd, setCustomRangeEnd] = useState('');
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);

  const [availabilityFormData, setAvailabilityFormData] = useState({
    barber: '',
    date: '',
    startTime: '09:00',
    endTime: '18:00'
  });
  const [formData, setFormData] = useState({
    name: '',
    role: 'Barber' as 'Barber' | 'Senior Barber' | 'Manager' | 'Receptionist',
    phone: '',
    email: '',
    schedule: '',
    status: 'Active' as 'Active' | 'Inactive',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '18:00',
    selectedDays: [] as string[]
  });

  // Calculate staff statistics
  const staffStats = useMemo(() => {
    const activeStaff = state.data.staff.filter(staff => staff.status === 'Active');
    const roleCount = state.data.staff.reduce((acc, staff) => {
      acc[staff.role] = (acc[staff.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: state.data.staff.length,
      active: activeStaff.length,
      inactive: state.data.staff.length - activeStaff.length,
      barbers: (roleCount['Barber'] || 0) + (roleCount['Senior Barber'] || 0),
      managers: roleCount['Manager'] || 0,
      receptionists: roleCount['Receptionist'] || 0
    };
  }, [state.data.staff]);

  const handleOpenModal = (staff?: StaffMember) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.name,
        role: staff.role,
        phone: staff.phone,
        email: staff.email || '',
        schedule: staff.schedule || '',
        status: staff.status,
        startDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '18:00',
        selectedDays: []
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        role: 'Barber',
        phone: '',
        email: '',
        schedule: '',
        status: 'Active',
        startDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '18:00',
        selectedDays: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    setFormData({
      name: '',
      role: 'Barber',
      phone: '',
      email: '',
      schedule: '',
      status: 'Active',
      startDate: '',
      endDate: '',
      startTime: '09:00',
      endTime: '18:00',
      selectedDays: []
    });
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const staffData: StaffMember = {
      name: formData.name,
      role: formData.role,
      phone: formData.phone,
      email: formData.email,
      schedule: formData.schedule,
      status: formData.status
    };

    if (editingStaff) {
      const staffIndex = state.data.staff.findIndex(s => 
        s.name === editingStaff.name && s.phone === editingStaff.phone
      );
      if (staffIndex !== -1) {
        dispatch({
          type: 'UPDATE_STAFF',
          payload: { index: staffIndex, updates: staffData }
        });
      }
    } else {
      dispatch({
        type: 'ADD_STAFF',
        payload: staffData
      });

      // Add staff overrides for selected days if specified
      if (formData.selectedDays.length > 0 && formData.startDate) {
        const startDate = new Date(formData.startDate);
        const endDate = formData.endDate ? new Date(formData.endDate) : startDate;
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
          if (formData.selectedDays.includes(dayName)) {
            dispatch({
              type: 'ADD_STAFF_OVERRIDE',
              payload: {
                name: formData.name,
                date: d.toISOString().split('T')[0],
                start: formData.startTime,
                end: formData.endTime
              }
            });
          }
        }
      }
    }

    handleCloseModal();
  };

  const handleDeleteStaff = (index: number) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      dispatch({
        type: 'DELETE_STAFF',
        payload: index
      });
    }
  };

  // Availability Modal Functions
  const handleOpenAvailabilityModal = (date?: string, barberName?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    setAvailabilityFormData({
      barber: barberName || '',
      date: targetDate,
      startTime: '09:00',
      endTime: '18:00'
    });
    setIsAvailabilityModalOpen(true);
  };

  const handleCloseAvailabilityModal = () => {
    setIsAvailabilityModalOpen(false);
    setAvailabilityFormData({
      barber: '',
      date: '',
      startTime: '09:00',
      endTime: '18:00'
    });
  };

  const handleAvailabilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch({
      type: 'ADD_STAFF_OVERRIDE',
      payload: {
        name: availabilityFormData.barber,
        date: availabilityFormData.date,
        start: availabilityFormData.startTime,
        end: availabilityFormData.endTime
      }
    });

    handleCloseAvailabilityModal();
  };

  const handleAvailabilityRangeChange = (range: string) => {
    setAvailabilityRange(range);
    setShowCustomRange(range === 'custom');
  };

  // Utility functions for availability grid
  const to12Hour = (hour: number, minute: number = 0): string => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = ((hour + 11) % 12) + 1;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${ampm}`;
  };

  const parseAmPm = (timeStr: string): { h: number; m: number } => {
    const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
    if (!match) return { h: 9, m: 0 };
    
    let hour = parseInt(match[1], 10);
    const minute = match[2] ? parseInt(match[2], 10) : 0;
    const ampm = match[3].toUpperCase();
    
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    return { h: hour, m: minute };
  };

  const isWorkingDay = (scheduleStr: string, dayAbbrev: string): { start: { h: number; m: number }; end: { h: number; m: number } } | null => {
    const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    if (!scheduleStr || !scheduleStr.includes(' ')) return null;
    
    const parts = scheduleStr.split(' ');
    const days = parts[0];
    const times = parts[1];
    const [startStr, endStr] = (times || '').split('-');
    
    const start = parseAmPm(startStr || '9AM');
    const end = parseAmPm(endStr || '6PM');
    const [from, to] = days.split('-');
    
    const fromIdx = dayOrder.indexOf(from);
    const toIdx = dayOrder.indexOf(to);
    
    let activeDays: string[] = [];
    if (fromIdx > -1 && toIdx > -1) {
      activeDays = fromIdx <= toIdx 
        ? dayOrder.slice(fromIdx, toIdx + 1)
        : [...dayOrder.slice(fromIdx), ...dayOrder.slice(0, toIdx + 1)];
    }
    
    return activeDays.includes(dayAbbrev) ? { start, end } : null;
  };

  // Generate dates for availability grid
  const getAvailabilityDates = (): Date[] => {
    if (availabilityRange === 'week') {
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1);
      
      const dates: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(date);
      }
      return dates;
    } else {
      if (!customRangeStart || !customRangeEnd) return [];
      
      const start = new Date(customRangeStart);
      const end = new Date(customRangeEnd);
      
      if (!isFinite(start.getTime()) || !isFinite(end.getTime()) || start > end) {
        return [];
      }
      
      const dates: Date[] = [];
      const maxDays = 14;
      let currentDate = new Date(start);
      let dayCount = 0;
      
      while (currentDate <= end && dayCount < maxDays) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
        dayCount++;
      }
      
      return dates;
    }
  };

  const availabilityDates = getAvailabilityDates();

  const getStatusBadgeVariant = (status: string) => {
    return status === 'Active' ? 'success' : 'danger';
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Manager': return 'danger';
      case 'Senior Barber': return 'warn';
      case 'Barber': return 'success';
      case 'Receptionist': return 'info';
      default: return 'info';
    }
  };

  const columns = [
    {
      key: 'name' as keyof StaffMember,
      header: 'Name',
      render: (_: any, staff: StaffMember) => staff.name
    },
    {
      key: 'role' as keyof StaffMember,
      header: 'Role',
      render: (_: any, staff: StaffMember) => (
        <Badge variant={getRoleBadgeVariant(staff.role)}>
          {staff.role}
        </Badge>
      )
    },
    {
      key: 'phone' as keyof StaffMember,
      header: 'Phone',
      render: (_: any, staff: StaffMember) => staff.phone
    },
    {
      key: 'schedule' as keyof StaffMember,
      header: 'Schedule',
      render: (_: any, staff: StaffMember) => staff.schedule || 'Not set'
    },
    {
      key: 'status' as keyof StaffMember,
      header: 'Status',
      render: (_: any, staff: StaffMember) => (
        <Badge variant={getStatusBadgeVariant(staff.status)}>
          {staff.status}
        </Badge>
      )
    },
    {
      key: 'name' as keyof StaffMember,
      header: 'Actions',
      render: (_: any, staff: StaffMember) => {
        const staffIndex = state.data.staff.findIndex(s => 
          s.name === staff.name && s.phone === staff.phone
        );
        return (
          <div className={styles.actions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenModal(staff)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteStaff(staffIndex)}
            >
              Delete
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className={styles.staff}>
      {/* Staff Statistics */}
      <div className={styles.statsGrid}>
        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>Total Staff</h3>
              <p className={styles.statsNumber}>{staffStats.total}</p>
              <p className={styles.statsDetail}>{staffStats.active} active, {staffStats.inactive} inactive</p>
            </div>
            <div className={styles.statsIcon}>👥</div>
          </div>
        </Card>

        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>Barbers</h3>
              <p className={styles.statsNumber}>{staffStats.barbers}</p>
              <p className={styles.statsDetail}>Service providers</p>
            </div>
            <div className={styles.statsIcon}>✂️</div>
          </div>
        </Card>

        <Card className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsText}>
              <h3>Support Staff</h3>
              <p className={styles.statsNumber}>{staffStats.managers + staffStats.receptionists}</p>
              <p className={styles.statsDetail}>{staffStats.managers} managers, {staffStats.receptionists} receptionists</p>
            </div>
            <div className={styles.statsIcon}>🏢</div>
          </div>
        </Card>
      </div>

      {/* Staff Table */}
      <Card>
        <div className={styles.tableHeader}>
          <h2>Staff Management</h2>
          <Button
            variant="primary"
            onClick={() => handleOpenModal()}
          >
            + Add Staff Member
          </Button>
        </div>
        
        <Table data={state.data.staff} columns={columns} />
        
        {state.data.staff.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
            No staff members added yet
          </div>
        )}
      </Card>

      {/* Barber Availability */}
      <Card>
        <div className={styles.availabilityHeader}>
          <div>
            <h3>Barber Availability</h3>
            <p className={styles.availabilitySubtext}>Shows who is working & when (by declared schedules & overrides)</p>
          </div>
          <div className={styles.availabilityControls}>
            <Select
              value={availabilityRange}
              onChange={(e) => handleAvailabilityRangeChange(e.target.value)}
              options={[
                { value: 'week', label: 'This Week' },
                { value: 'custom', label: 'Custom Range' }
              ]}
            />
            {showCustomRange && (
              <>
                <Input
                  type="date"
                  value={customRangeStart}
                  onChange={(e) => setCustomRangeStart(e.target.value)}
                />
                <Input
                  type="date"
                  value={customRangeEnd}
                  onChange={(e) => setCustomRangeEnd(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {}} // Trigger re-render with new dates
                >
                  Apply
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className={styles.scheduleGridContainer}>
          {availabilityDates.length > 0 ? (
            <div 
              className={styles.scheduleGrid}
              style={{
                gridTemplateColumns: `${isMobile ? '90px' : '120px'} repeat(${availabilityDates.length}, 1fr)`
              }}
            >
              {/* Header Row */}
              <div className={`${styles.slot} ${styles.header}`}>Staff</div>
              {availabilityDates.map((date, index) => (
                <div key={index} className={`${styles.slot} ${styles.header}`}>
                  {date.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              ))}
              
              {/* Staff Rows */}
              {state.data.staff.map((staff, staffIndex) => (
                <React.Fragment key={staffIndex}>
                  <div className={`${styles.slot} ${styles.header} ${styles.name}`}>
                    {staff.name}
                  </div>
                  {availabilityDates.map((date, dateIndex) => {
                    const dayAbbrev = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dateStr = date.toISOString().split('T')[0];
                    
                    // Check for staff overrides for this specific date
                    const overrides = state.data.staffOverrides?.filter(
                      override => override.name === staff.name && override.date === dateStr
                    ).sort((a, b) => a.start.localeCompare(b.start)) || [];
                    
                    // Check base schedule for this day of week
                    const baseSchedule = isWorkingDay(staff.schedule || '', dayAbbrev);
                    
                    const isAvailable = overrides.length > 0 || baseSchedule;
                    
                    return (
                      <div
                        key={dateIndex}
                        className={`${styles.slot} ${
                          isAvailable ? styles.available : styles.off
                        }`}
                        data-date={dateStr}
                        data-barber={staff.name}
                        onClick={() => handleOpenAvailabilityModal(dateStr, staff.name)}
                      >
                        {overrides.length > 0 ? (
                          <div>
                            {overrides.map((override, i) => (
                              <div key={i}>
                                {override.start}-{override.end}
                              </div>
                            ))}
                          </div>
                        ) : baseSchedule ? (
                          <div>
                            {to12Hour(baseSchedule.start.h, baseSchedule.start.m)} – {to12Hour(baseSchedule.end.h, baseSchedule.end.m)}
                          </div>
                        ) : (
                          <div>Off</div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className={styles.emptyGrid}>
              {availabilityRange === 'custom' 
                ? 'Please select a valid date range to view availability'
                : 'No staff members to display'
              }
            </div>
          )}
        </div>
      </Card>

      {/* Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <label>
              Name
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </label>

            <label>
              Role
              <Select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                options={Roles.map(role => ({
                  value: role,
                  label: role
                }))}
                required
              />
            </label>

            <label>
              Phone
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </label>

            <label>
              Email
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </label>

            <label className={styles.fullWidth}>
              Schedule Label (optional)
              <Input
                value={formData.schedule}
                onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                placeholder="e.g., Mon-Fri 09:00-18:00"
              />
            </label>

            {!editingStaff && (
              <div className={styles.fullWidth}>
                <div className={styles.availabilitySection}>
                  <p className={styles.sectionTitle}>Add Initial Availability</p>
                  
                  <div className={styles.dateTimeGrid}>
                    <label>
                      Start Date
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </label>
                    
                    <label>
                      End Date
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </label>
                    
                    <label>
                      Start Time
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </label>
                    
                    <label>
                      End Time
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </label>
                  </div>

                  <div className={styles.daysGrid}>
                    {DaysOfWeek.map(day => (
                      <label key={day.value} className={styles.dayCheckbox}>
                        <input
                          type="checkbox"
                          checked={formData.selectedDays.includes(day.value)}
                          onChange={() => handleDayToggle(day.value)}
                        />
                        {day.label}
                      </label>
                    ))}
                  </div>
                  
                  <p className={styles.availabilityNote}>
                    We'll add availability overrides for selected days between the dates.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Availability Modal */}
      <Modal 
        isOpen={isAvailabilityModalOpen} 
        onClose={handleCloseAvailabilityModal}
        title="Set Availability Override"
      >
        <form onSubmit={handleAvailabilitySubmit}>
          <div className={styles.formGrid}>
            <div>
              <label>Barber</label>
              <Select
                value={availabilityFormData.barber}
                onChange={(e) => setAvailabilityFormData(prev => ({
                  ...prev,
                  barber: e.target.value
                }))}
                options={state.data.staff.map(staff => ({
                  value: staff.name,
                  label: staff.name
                }))}
                required
              />
            </div>
            
            <div>
              <label>Date</label>
              <Input
                type="date"
                value={availabilityFormData.date}
                onChange={(e) => setAvailabilityFormData(prev => ({
                  ...prev,
                  date: e.target.value
                }))}
                required
              />
            </div>
            
            <div>
              <label>Start Time</label>
              <Input
                type="time"
                value={availabilityFormData.startTime}
                onChange={(e) => setAvailabilityFormData(prev => ({
                  ...prev,
                  startTime: e.target.value
                }))}
                required
              />
            </div>
            
            <div>
              <label>End Time</label>
              <Input
                type="time"
                value={availabilityFormData.endTime}
                onChange={(e) => setAvailabilityFormData(prev => ({
                  ...prev,
                  endTime: e.target.value
                }))}
                required
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={handleCloseAvailabilityModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Set Override
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Staff;