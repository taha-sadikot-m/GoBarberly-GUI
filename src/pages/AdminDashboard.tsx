import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui';
import { type AdminStats, type Barbershop } from '../types/user';
import BarbershopManagement from '../components/admin/BarbershopManagement';
import { useAuth } from '../context/AuthContext';
import styles from './AdminDashboard.module.css';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'barbershops'>('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalBarbershops: 0,
    activeBarbershops: 0,
    totalAppointments: 0,
    monthlyRevenue: 0
  });
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls - in real app, these would be actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for admin
      const mockStats: AdminStats = {
        totalBarbershops: 8,
        activeBarbershops: 7,
        totalAppointments: 450,
        monthlyRevenue: 35000
      };

      const mockBarbershops: Barbershop[] = [
        {
          id: 'bb1',
          email: 'owner@cutandstylebarbershop.com',
          name: 'Mike Wilson',
          shopName: 'Cut & Style Barbershop',
          shopOwnerName: 'Mike Wilson',
          role: 'barbershop' as any,
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date('2024-03-01'),
          isActive: true,
          address: '123 Main St, New York, NY',
          phone: '+1-555-0123',
          createdBy: 'current-admin-id',
          subscription: {
            plan: 'Premium',
            status: 'active',
            expiresAt: new Date('2025-03-01')
          }
        },
        {
          id: 'bb2',
          email: 'contact@gentlemanscut.com',
          name: 'David Brown',
          shopName: "Gentleman's Cut",
          shopOwnerName: 'David Brown',
          role: 'barbershop' as any,
          createdAt: new Date('2024-03-15'),
          updatedAt: new Date('2024-03-15'),
          isActive: true,
          address: '456 Oak Ave, Los Angeles, CA',
          phone: '+1-555-0456',
          createdBy: 'current-admin-id',
          subscription: {
            plan: 'Basic',
            status: 'active',
            expiresAt: new Date('2025-03-15')
          }
        }
      ];

      setStats(mockStats);
      setBarbershops(mockBarbershops);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBarbershop = (barbershopData: any) => {
    const newBarbershop: Barbershop = {
      id: Date.now().toString(),
      ...barbershopData,
      role: 'barbershop' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      createdBy: 'current-admin-id',
      subscription: {
        plan: 'Basic',
        status: 'active',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    };
    setBarbershops(prev => [...prev, newBarbershop]);
    setStats(prev => ({ 
      ...prev, 
      totalBarbershops: prev.totalBarbershops + 1,
      activeBarbershops: prev.activeBarbershops + 1
    }));
  };

  const handleUpdateBarbershop = (barbershopId: string, updates: any) => {
    setBarbershops(prev => prev.map(barbershop => 
      barbershop.id === barbershopId 
        ? { ...barbershop, ...updates, updatedAt: new Date() }
        : barbershop
    ));
  };

  const handleDeleteBarbershop = (barbershopId: string) => {
    setBarbershops(prev => prev.filter(barbershop => barbershop.id !== barbershopId));
    setStats(prev => ({ 
      ...prev, 
      totalBarbershops: prev.totalBarbershops - 1,
      activeBarbershops: prev.activeBarbershops - 1
    }));
  };

  if (isLoading) {
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
            <span className={styles.welcomeText}>Welcome, {user?.name}</span>
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
                  <h3>${stats.monthlyRevenue.toLocaleString()}</h3>
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
                      <p><strong>Premium Cuts</strong> processed $450 in sales</p>
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
            barbershops={barbershops}
            onAdd={handleAddBarbershop}
            onUpdate={handleUpdateBarbershop}
            onDelete={handleDeleteBarbershop}
          />
        )}
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;