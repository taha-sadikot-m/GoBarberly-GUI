import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Select } from '../ui';
import { useApp } from '../../context/AppContext';
import { exportToCsv } from '../../utils';
import styles from '../../styles/components/Header.module.css';
import type { RangeType } from '../../types';

interface HeaderProps {
  title: string;
  subtitle: string;
  onMenuClick?: () => void;
}

const rangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'fy', label: 'This FY' },
  { value: 'custom', label: 'Custom…' },
];

const Header: React.FC<HeaderProps> = ({ title, subtitle, onMenuClick }) => {
  const navigate = useNavigate();
  const { state, setRange } = useApp();
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserDropdown]);

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as RangeType;
    
    if (type === 'custom') {
      setShowCustomRange(true);
    } else {
      setShowCustomRange(false);
      setRange(type);
    }
  };

  const handleApplyCustomRange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate + 'T23:59:59');
      setRange('custom', start, end);
      setShowCustomRange(false);
    }
  };

  const handleExport = () => {
    // Export current view data to CSV
    const currentPath = window.location.pathname;
    let data: any[] = [];
    let filename = '';

    switch (currentPath) {
      case '/':
        data = state.data.appointments;
        filename = 'dashboard-data.csv';
        break;
      case '/appointments':
        data = state.data.appointments;
        filename = 'appointments.csv';
        break;
      case '/sales':
        data = state.data.sales;
        filename = 'sales.csv';
        break;
      case '/staff':
        data = state.data.staff;
        filename = 'staff.csv';
        break;
      case '/inventory':
        data = state.data.inventory;
        filename = 'inventory.csv';
        break;
      case '/customers':
        data = state.data.customers;
        filename = 'customers.csv';
        break;
      case '/history':
        data = state.data.history;
        filename = 'history.csv';
        break;
      default:
        data = [];
        filename = 'export.csv';
    }

    if (data.length > 0) {
      exportToCsv(data, filename);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getUserName = () => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.name || userData.email;
    }
    return 'User';
  };

  return (
    <header className={styles.header}>
      <div className={styles.titles}>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      
      <div className={styles.toolbar}>
        <Select
          value={state.rangeState.type}
          onChange={handleRangeChange}
          options={rangeOptions}
          id="globalRange"
        />
        
        {showCustomRange && (
          <>
            <input
              type="date"
              className={styles.input}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              id="rangeStart"
            />
            <input
              type="date"
              className={styles.input}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              id="rangeEnd"
            />
            <Button onClick={handleApplyCustomRange}>
              Apply
            </Button>
          </>
        )}
        
        <Button variant="ghost" onClick={handleExport} title="Export CSV of what you're viewing">
          ⬇️ Export CSV
        </Button>

        <div className={styles.userDropdown} ref={dropdownRef}>
          <Button 
            variant="ghost" 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className={styles.userButton}
          >
            👤 {getUserName()}
          </Button>
          
          {showUserDropdown && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownItem}>
                <span>Signed in as</span>
                <strong>{getUserName()}</strong>
              </div>
              <div className={styles.dropdownDivider}></div>
              <button 
                className={styles.dropdownItem}
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>

        <Button variant="ghost" onClick={onMenuClick} className={styles.menuButton}>
          ☰
        </Button>
      </div>
    </header>
  );
};

export default Header;