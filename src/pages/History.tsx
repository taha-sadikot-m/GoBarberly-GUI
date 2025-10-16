import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import '../styles/globals.css';

interface HistoryEntry {
  id: string;
  date: string;
  time: string;
  action: string;
  section: string;
  details: string;
  user: string;
}

const History: React.FC = () => {
  const { state } = useApp();
  const [historyFilter, setHistoryFilter] = useState('all');

  // Generate history entries from system data
  const generateHistoryEntries = (): HistoryEntry[] => {
    const entries: HistoryEntry[] = [];

    // Safely access data with fallback to empty arrays
    const appointments = state.data?.appointments || [];
    const sales = state.data?.sales || [];
    const staff = state.data?.staff || [];
    const inventory = state.data?.inventory || [];
    const customers = state.data?.customers || [];

    // Recent appointments
    appointments.slice(-15).forEach((appointment, index) => {
      entries.push({
        id: `appointment-${index}`,
        date: appointment.date,
        time: appointment.time,
        action: 'Created',
        section: 'Appointments',
        details: `${appointment.service} with ${appointment.barber} for ${appointment.customer}`,
        user: 'Admin'
      });
    });

    // Recent sales
    sales.slice(-15).forEach((sale, index) => {
      entries.push({
        id: `sale-${index}`,
        date: sale.date,
        time: '12:00', // Sales don't have time in the interface, so use default
        action: 'Recorded',
        section: 'Sales',
        details: `₹${sale.amount} - ${sale.service} by ${sale.barber}`,
        user: 'Admin'
      });
    });

    // Recent staff activities
    staff.slice(-10).forEach((staffMember, index) => {
      entries.push({
        id: `staff-${index}`,
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        action: 'Added',
        section: 'Staff',
        details: `${staffMember.name} - ${staffMember.role} (${staffMember.status})`,
        user: 'Admin'
      });
    });

    // Recent inventory updates
    inventory.slice(-10).forEach((item, index) => {
      entries.push({
        id: `inventory-${index}`,
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        action: 'Updated',
        section: 'Inventory',
        details: `${item.name} - Stock: ${item.quantity} (Min: ${item.minStock})`,
        user: 'Admin'
      });
    });

    // Recent customer activities
    customers.slice(-10).forEach((customer, index) => {
      entries.push({
        id: `customer-${index}`,
        date: new Date().toISOString().split('T')[0],
        time: '11:00',
        action: 'Added',
        section: 'Customers',
        details: `${customer.name} - ${customer.phone} (${customer.visits} visits)`,
        user: 'Admin'
      });
    });

    return entries.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
  };

  const historyEntries = generateHistoryEntries();
  const filteredHistory = historyFilter === 'all' 
    ? historyEntries 
    : historyEntries.filter(entry => entry.section.toLowerCase() === historyFilter);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="section">
      <div className="card">
        <div className="between" style={{ padding: '1rem', borderBottom: '1px solid var(--slate-200)' }}>
          <h3 style={{ margin: 0 }}>System History & Audit Log</h3>
          <select 
            className="select" 
            value={historyFilter} 
            onChange={(e) => setHistoryFilter(e.target.value)}
          >
            <option value="all">All Activities</option>
            <option value="appointments">Appointments</option>
            <option value="sales">Sales</option>
            <option value="staff">Staff</option>
            <option value="inventory">Inventory</option>
            <option value="customers">Customers</option>
          </select>
        </div>
        <div className="table">
          <table>
            <thead className="th">
              <tr>
                <th>Date & Time</th>
                <th>Action</th>
                <th>Section</th>
                <th>Details</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(entry => (
                <tr key={entry.id}>
                  <td>
                    <div>{formatDate(entry.date)}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {formatTime(entry.time)}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      entry.action === 'Created' ? 'success' :
                      entry.action === 'Updated' ? 'warn' :
                      entry.action === 'Recorded' ? 'success' :
                      entry.action === 'Added' ? 'success' : ''
                    }`}>
                      {entry.action}
                    </span>
                  </td>
                  <td>{entry.section}</td>
                  <td>{entry.details}</td>
                  <td>{entry.user}</td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No activities found for the selected filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;