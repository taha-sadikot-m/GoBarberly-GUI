import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui';
import { type SuperAdminStats } from '../types/user';
import AdminManagement from '../components/admin/AdminManagement';
import BarbershopManagement from '../components/admin/BarbershopManagement';
import ArchiveManagement from '../components/admin/ArchiveManagement';
import { useAuth } from '../context/AuthContext';
import { superAdminService } from '../services/superAdminApi';

import styles from './SuperAdminDashboard.module.css';

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, state } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'admins' | 'barbershops' | 'archive'>('overview');
  const [stats, setStats] = useState<SuperAdminStats>({
    totalAdmins: 0,
    totalBarbershops: 0,
    activeBarbershops: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  });


  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      console.log('SuperAdminDashboard: refreshing dashboard data');
    } else {
      setIsInitialLoading(true);
    }
    setError(null);
    
    try {
      // Load dashboard data from backend API
      const dashboardData = await superAdminService.getDashboardData();
      
      // Convert backend stats to frontend format
      const frontendStats: SuperAdminStats = {
        totalAdmins: dashboardData.stats.total_admins,
        totalBarbershops: dashboardData.stats.total_barbershops,
        activeBarbershops: dashboardData.stats.active_barbershops,
        totalRevenue: Number(dashboardData.stats.total_revenue),
        monthlyGrowth: dashboardData.stats.monthly_growth
      };

      setStats(frontendStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      if (isRefresh) {
        console.log('SuperAdminDashboard: finished refreshing dashboard data');
      } else {
        setIsInitialLoading(false);
      }
    }
  };





  if (isInitialLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading Super Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.error}>
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <Button onClick={() => loadDashboardData(false)}>Try Again</Button>
        </div>
      </div>
    );
  }





  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardContent}>
        <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>🔧 Super Admin Dashboard</h1>
            <p>Manage the entire GoBarberly system</p>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.welcomeText}>Welcome, {state.user?.name}</span>
            <Button
              onClick={async () => {
                console.log('SuperAdmin logout button clicked'); // Debug log
                try {
                  logout();
                  console.log('Logout completed, navigating to login'); // Debug log
                  navigate('/login', { replace: true });
                } catch (error) {
                  console.error('Logout error:', error);
                }
              }}
              className={styles.logoutButton}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'admins' ? styles.active : ''}`}
          onClick={() => setActiveTab('admins')}
        >
          👥 Admins ({stats.totalAdmins})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'barbershops' ? styles.active : ''}`}
          onClick={() => setActiveTab('barbershops')}
        >
          ✂️ Barbershops ({stats.totalBarbershops})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'archive' ? styles.active : ''}`}
          onClick={() => setActiveTab('archive')}
        >
          🗄️ Archive
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            <div className={styles.statsGrid}>
              <Card className={styles.statCard}>
                <div className={styles.statIcon}>👥</div>
                <div className={styles.statContent}>
                  <h3>{stats.totalAdmins}</h3>
                  <p>Total Admins</p>
                </div>
              </Card>

              <Card className={styles.statCard}>
                <div className={styles.statIcon}>✂️</div>
                <div className={styles.statContent}>
                  <h3>{stats.totalBarbershops}</h3>
                  <p>Total Barbershops</p>
                </div>
              </Card>

              <Card className={styles.statCard}>
                <div className={styles.statIcon}>🟢</div>
                <div className={styles.statContent}>
                  <h3>{stats.activeBarbershops}</h3>
                  <p>Active Barbershops</p>
                </div>
              </Card>

              <Card className={styles.statCard}>
                <div className={styles.statIcon}>💰</div>
                <div className={styles.statContent}>
                  <h3>₹{stats.totalRevenue.toLocaleString('en-IN')}</h3>
                  <p>Total Revenue</p>
                </div>
              </Card>

              <Card className={styles.statCard}>
                <div className={styles.statIcon}>📈</div>
                <div className={styles.statContent}>
                  <h3>+{stats.monthlyGrowth}%</h3>
                  <p>Monthly Growth</p>
                </div>
              </Card>
            </div>

            <div className={styles.quickActions}>
              <h2>Quick Actions</h2>
              <div className={styles.actionButtons}>
                <button 
                  className={styles.actionButton}
                  onClick={() => setActiveTab('admins')}
                >
                  ➕ Add New Admin
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={() => setActiveTab('barbershops')}
                >
                  🏪 Add New Barbershop
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <AdminManagement
            onDataChange={() => loadDashboardData(true)}
          />
        )}

        {activeTab === 'barbershops' && (
          <BarbershopManagement
            onDataChange={() => loadDashboardData(true)}
          />
        )}

        {activeTab === 'archive' && (
          <ArchiveManagement
            onDataChange={() => loadDashboardData(true)}
          />
        )}
      </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;