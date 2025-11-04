import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui';
import { type AdminStats } from '../types/user';
import BarbershopManagement from '../components/admin/BarbershopManagement';
import AdminArchiveManagement from '../components/admin/AdminArchiveManagement';
import { useAuth } from '../context/AuthContext';
import { superAdminService } from '../services/superAdminApi';
import { adminService } from '../services/adminApi';
import styles from './AdminDashboard.module.css';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, state } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'barbershops' | 'archive'>('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalBarbershops: 0,
    activeBarbershops: 0,
    totalAppointments: 0,
    monthlyRevenue: 0
  });

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Get appropriate API service based on user role
  const getApiService = () => {
    console.log('AdminDashboard - Current user role:', state.user?.role);
    return state.user?.role === 'super_admin' ? superAdminService : adminService;
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      console.log('AdminDashboard: refreshing dashboard data');
    } else {
      setIsInitialLoading(true);
    }
    try {
      const apiService = getApiService();
      console.log('AdminDashboard - Loading dashboard stats with:', state.user?.role === 'super_admin' ? 'superAdminService' : 'adminService');
      
      // Try to load real dashboard stats
      const dashboardStats = await apiService.getDashboardStats();
      console.log('AdminDashboard - Dashboard stats loaded:', dashboardStats);
      
      // Convert API response (snake_case) to frontend interface (camelCase)
      const processedStats: AdminStats = {
        totalBarbershops: Number((dashboardStats as any).total_barbershops || 0),
        activeBarbershops: Number((dashboardStats as any).active_barbershops || 0),
        totalAppointments: Number((dashboardStats as any).total_appointments || 0),
        monthlyRevenue: Number((dashboardStats as any).monthly_revenue || 0)
      };
      
      setStats(processedStats);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      
      // Fallback to mock data if API fails
      const mockStats: AdminStats = {
        totalBarbershops: 8,
        activeBarbershops: 7,
        totalAppointments: 450,
        monthlyRevenue: 35000
      };
      setStats(mockStats);
    } finally {
      if (isRefresh) {
        console.log('AdminDashboard: finished refreshing dashboard data');
      } else {
        setIsInitialLoading(false);
      }
    }
  };



  if (isInitialLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardContent}>
        <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>👨‍💼 Admin Dashboard</h1>
            <p>Manage barbershops and monitor performance</p>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.welcomeText}>Welcome, {state.user?.name}</span>
            <Button 
              onClick={async () => {
                console.log('Admin logout button clicked'); // Debug log
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
          className={`${styles.tab} ${activeTab === 'barbershops' ? styles.active : ''}`}
          onClick={() => setActiveTab('barbershops')}
        >
          ✂️ My Barbershops ({stats.totalBarbershops})
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
                <div className={styles.statIcon}>📅</div>
                <div className={styles.statContent}>
                  <h3>{stats.totalAppointments}</h3>
                  <p>Total Appointments</p>
                </div>
              </Card>

              <Card className={styles.statCard}>
                <div className={styles.statIcon}>💰</div>
                <div className={styles.statContent}>
                  <h3>₹{stats.monthlyRevenue.toLocaleString('en-IN')}</h3>
                  <p>Monthly Revenue</p>
                </div>
              </Card>
            </div>

            <div className={styles.recentActivity}>
              <h2>Recent Activity</h2>
              <Card className={styles.activityCard}>
                <div className={styles.activityList}>
                  <div className={styles.activityItem}>
                    <div className={styles.activityIcon}>✂️</div>
                    <div className={styles.activityContent}>
                      <p><strong>Cut & Style Barbershop</strong> updated their services</p>
                      <span>2 hours ago</span>
                    </div>
                  </div>
                  <div className={styles.activityItem}>
                    <div className={styles.activityIcon}>🆕</div>
                    <div className={styles.activityContent}>
                      <p><strong>Gentleman's Cut</strong> added 3 new appointments</p>
                      <span>5 hours ago</span>
                    </div>
                  </div>
                  <div className={styles.activityItem}>
                    <div className={styles.activityIcon}>💰</div>
                    <div className={styles.activityContent}>
                      <p><strong>Premium Cuts</strong> processed ₹450 in sales</p>
                      <span>1 day ago</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className={styles.quickActions}>
              <h2>Quick Actions</h2>
              <div className={styles.actionButtons}>
                <button 
                  className={styles.actionButton}
                  onClick={() => setActiveTab('barbershops')}
                >
                  🏪 Add New Barbershop
                </button>
                <button className={styles.actionButton}>
                  📊 View Reports
                </button>
                <button className={styles.actionButton}>
                  📞 Contact Support
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'barbershops' && (
          <BarbershopManagement
            onDataChange={() => loadDashboardData(true)}
          />
        )}

        {activeTab === 'archive' && (
          <AdminArchiveManagement
            onDataChange={() => loadDashboardData(true)}
          />
        )}
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;