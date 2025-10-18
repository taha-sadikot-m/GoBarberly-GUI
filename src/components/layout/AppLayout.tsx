import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';
import styles from '../../styles/components/AppLayout.module.css';

const pageInfo: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Welcome to your barbershop management system',
  },
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Welcome to your barbershop management system',
  },
  '/appointments': {
    title: 'Appointments',
    subtitle: 'Manage your daily appointments and schedule',
  },
  '/sales': {
    title: 'Sales',
    subtitle: 'Track sales and revenue performance',
  },
  '/staff': {
    title: 'Staff',
    subtitle: 'Manage your team and staff schedules',
  },
  '/inventory': {
    title: 'Inventory',
    subtitle: 'Monitor stock levels and supplies',
  },
  '/customers': {
    title: 'Customers',
    subtitle: 'Manage customer relationships and history',
  },
  '/reports': {
    title: 'Reports',
    subtitle: 'Analyze performance and generate reports',
  },
  '/history': {
    title: 'History',
    subtitle: 'System activity log and audit trail',
  },
};

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentPageInfo = pageInfo[location.pathname] || {
    title: 'Dashboard',
    subtitle: 'Welcome to your barbershop management system',
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={styles.container}>
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className={styles.main}>
        <Header
          title={currentPageInfo.title}
          subtitle={currentPageInfo.subtitle}
          onMenuClick={toggleSidebar}
        />
        <MainContent />
      </div>
      
      {sidebarOpen && (
        <div className={styles.overlay} onClick={closeSidebar} />
      )}
    </div>
  );
};

export default AppLayout;