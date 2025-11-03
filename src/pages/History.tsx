import React, { useState } from 'react';
import { useBarbershopHistory } from '../hooks/useBarbershopHistory';
import '../styles/globals.css';

const History: React.FC = () => {
  const {
    history,
    loading,
    error,
    filterByActionType,
    filterByPeriod,
    refresh
  } = useBarbershopHistory();
  
  const [historyFilter, setHistoryFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month'>('week');

  // Handle filter changes
  const handleFilterChange = (filter: string) => {
    setHistoryFilter(filter);
    if (filter === 'all') {
      // Reset to show all activities
      refresh();
    } else {
      // Filter by specific action type
      filterByActionType(filter);
    }
  };

  const handlePeriodChange = (period: 'today' | 'week' | 'month') => {
    setPeriodFilter(period);
    filterByPeriod(period);
  };

  const filteredHistory = historyFilter === 'all' 
    ? history 
    : history.filter(entry => entry.action_type.toLowerCase().includes(historyFilter.toLowerCase()));

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const getActionBadgeClass = (actionType: string) => {
    if (actionType.toLowerCase().includes('create') || actionType.toLowerCase().includes('add')) return 'success';
    if (actionType.toLowerCase().includes('update') || actionType.toLowerCase().includes('edit')) return 'warn';
    if (actionType.toLowerCase().includes('delete') || actionType.toLowerCase().includes('remove')) return 'danger';
    return 'info';
  };

  const getSectionFromActionType = (actionType: string) => {
    if (actionType.toLowerCase().includes('appointment')) return 'Appointments';
    if (actionType.toLowerCase().includes('sale')) return 'Sales';
    if (actionType.toLowerCase().includes('staff')) return 'Staff';
    if (actionType.toLowerCase().includes('inventory')) return 'Inventory';
    if (actionType.toLowerCase().includes('customer')) return 'Customers';
    if (actionType.toLowerCase().includes('profile')) return 'Profile';
    return 'System';
  };

  if (loading) {
    return (
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading activity history...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ color: 'var(--red-500)', marginBottom: '1rem' }}>
            Error loading activity history: {error}
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => refresh()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="card">
        <div className="between" style={{ padding: '1rem', borderBottom: '1px solid var(--slate-200)' }}>
          <h3 style={{ margin: 0 }}>System History & Audit Log</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select 
              className="select" 
              value={periodFilter} 
              onChange={(e) => handlePeriodChange(e.target.value as 'today' | 'week' | 'month')}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select 
              className="select" 
              value={historyFilter} 
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="all">All Activities</option>
              <option value="appointment">Appointments</option>
              <option value="sale">Sales</option>
              <option value="staff">Staff</option>
              <option value="inventory">Inventory</option>
              <option value="customer">Customers</option>
              <option value="profile">Profile</option>
            </select>
          </div>
        </div>
        <div className="table">
          <table>
            <thead className="th">
              <tr>
                <th>Date & Time</th>
                <th>Action</th>
                <th>Section</th>
                <th>Details</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(entry => {
                const { date, time } = formatDateTime(entry.created_at);
                return (
                  <tr key={entry.id}>
                    <td>
                      <div>{date}</div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {time}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getActionBadgeClass(entry.action_type)}`}>
                        {entry.action_type}
                      </span>
                    </td>
                    <td>{getSectionFromActionType(entry.action_type)}</td>
                    <td>{entry.description}</td>
                    <td>#{entry.id}</td>
                  </tr>
                );
              })}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    {historyFilter === 'all' 
                      ? 'No activities found' 
                      : `No ${historyFilter} activities found for the selected period`
                    }
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