import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui';
import { UserRole, type SuperAdminStats, type Admin, type Barbershop } from '../types/user';
import AdminManagement from '../components/admin/AdminManagement';
import BarbershopManagement from '../components/admin/BarbershopManagement';
import { useAuth } from '../context/AuthContext';
import styles from './SuperAdminDashboard.module.css';

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'admins' | 'barbershops'>('overview');
  const [stats, setStats] = useState<SuperAdminStats>({
    totalAdmins: 0,
    totalBarbershops: 0,
    activeBarbershops: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  });
  const [admins, setAdmins] = useState<Admin[]>([]);
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
      
      // Mock data
      const mockStats: SuperAdminStats = {
        totalAdmins: 5,
        totalBarbershops: 25,
        activeBarbershops: 22,
        totalRevenue: 125000,
        monthlyGrowth: 15.2
      };

      const mockAdmins: Admin[] = [
        {
          id: '1',
          email: 'john.admin@gobarberly.com',
          name: 'John Smith',
          role: UserRole.ADMIN,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          isActive: true,
          createdBy: 'super-admin-1',
          managedBarbershops: ['bb1', 'bb2', 'bb3']
        },
        {
          id: '2',
          email: 'sarah.admin@gobarberly.com', 
          name: 'Sarah Johnson',
          role: UserRole.ADMIN,
          createdAt: new Date('2024-02-10'),
          updatedAt: new Date('2024-02-10'),
          isActive: true,
          createdBy: 'super-admin-1',
          managedBarbershops: ['bb4', 'bb5']
        }
      ];

      const mockBarbershops: Barbershop[] = [
        {
          id: 'bb1',
          email: 'owner@cutandstylebarbershop.com',
          name: 'Mike Wilson',
          shopName: 'Cut & Style Barbershop',
          shopOwnerName: 'Mike Wilson',
          role: UserRole.BARBERSHOP,
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date('2024-03-01'),
          isActive: true,
          address: '123 Main St, New York, NY',
          phone: '+1-555-0123',
          createdBy: '1',
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
          role: UserRole.BARBERSHOP,
          createdAt: new Date('2024-03-15'),
          updatedAt: new Date('2024-03-15'),
          isActive: true,
          address: '456 Oak Ave, Los Angeles, CA',
          phone: '+1-555-0456',
          createdBy: '1',
          subscription: {
            plan: 'Basic',
            status: 'active',
            expiresAt: new Date('2025-03-15')
          }
        }
      ];

      setStats(mockStats);
      setAdmins(mockAdmins);
      setBarbershops(mockBarbershops);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = (adminData: any) => {
    // In real app, this would call API
    const newAdmin: Admin = {
      id: Date.now().toString(),
      ...adminData,
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      createdBy: 'current-super-admin-id',
      managedBarbershops: []
    };
    setAdmins(prev => [...prev, newAdmin]);
    setStats(prev => ({ ...prev, totalAdmins: prev.totalAdmins + 1 }));
  };

  const handleUpdateAdmin = (adminId: string, updates: any) => {
    setAdmins(prev => prev.map(admin => 
      admin.id === adminId 
        ? { ...admin, ...updates, updatedAt: new Date() }
        : admin
    ));
  };

  const handleDeleteAdmin = (adminId: string) => {
    setAdmins(prev => prev.filter(admin => admin.id !== adminId));
    setStats(prev => ({ ...prev, totalAdmins: prev.totalAdmins - 1 }));
  };

  const handleAddBarbershop = (barbershopData: any) => {
    const newBarbershop: Barbershop = {
      id: Date.now().toString(),
      ...barbershopData,
      role: UserRole.BARBERSHOP,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      createdBy: 'current-super-admin-id',
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
        <p>Loading Super Admin Dashboard...</p>
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
            <span className={styles.welcomeText}>Welcome, {user?.name}</span>
            <Button 
              onClick={() => {
                logout();
                navigate('/login');
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
                  <h3>${stats.totalRevenue.toLocaleString()}</h3>
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
            admins={admins}
            onAdd={handleAddAdmin}
            onUpdate={handleUpdateAdmin}
            onDelete={handleDeleteAdmin}
          />
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

export default SuperAdminDashboard;