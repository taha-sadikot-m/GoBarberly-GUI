import React, { useState, useEffect } from 'react';
import { Card, Button } from '../ui';
import { useToast } from '../../context/ToastContext';
import { superAdminService } from '../../services/superAdminApi';
import styles from './ArchiveManagement.module.css';

interface ArchivedUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'barbershop';
  shop_name?: string;
  shop_owner_name?: string;
  deleted_at: string;
  deleted_by: {
    id: number;
    name: string;
    email: string;
  } | null;
  created_at: string;
}

interface ArchiveManagementProps {
  onDataChange?: () => void;
}

const ArchiveManagement: React.FC<ArchiveManagementProps> = ({ onDataChange }) => {
  const { showSuccess, showError } = useToast();
  const [activeArchiveTab, setActiveArchiveTab] = useState<'admins' | 'barbershops'>('admins');
  const [archivedAdmins, setArchivedAdmins] = useState<ArchivedUser[]>([]);
  const [archivedBarbershops, setArchivedBarbershops] = useState<ArchivedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmRestore, setConfirmRestore] = useState<number | null>(null);

  useEffect(() => {
    loadArchivedData();
  }, []);

  const loadArchivedData = async () => {
    try {
      setIsLoading(true);
      
      // Load archived admins
      const archivedAdminsData = await superAdminService.getArchivedAdmins();
      const mappedAdmins: ArchivedUser[] = (archivedAdminsData.admins || []).map((admin: any) => ({
        id: admin.id,
        email: admin.email,
        name: admin.name || `${admin.first_name} ${admin.last_name}`.trim(),
        role: 'admin' as const,
        deleted_at: admin.deleted_at,
        deleted_by: admin.deleted_by,
        created_at: admin.created_at
      }));
      setArchivedAdmins(mappedAdmins);

      // Load archived barbershops
      const archivedBarbershopsData = await superAdminService.getArchivedBarbershops();
      const mappedBarbershops: ArchivedUser[] = (archivedBarbershopsData.barbershops || []).map((barbershop: any) => ({
        id: barbershop.id,
        email: barbershop.email,
        name: barbershop.shop_owner_name || barbershop.name || `${barbershop.first_name} ${barbershop.last_name}`.trim(),
        role: 'barbershop' as const,
        shop_name: barbershop.shop_name,
        shop_owner_name: barbershop.shop_owner_name,
        deleted_at: barbershop.deleted_at,
        deleted_by: barbershop.deleted_by,
        created_at: barbershop.created_at
      }));
      setArchivedBarbershops(mappedBarbershops);

    } catch (error) {
      console.error('Failed to load archived data:', error);
      showError('Failed to load archived data. Please try again.', 'Loading Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (userId: number, userType: 'admin' | 'barbershop') => {
    try {
      await superAdminService.restoreUser(userId, userType);
      
      // Reload data
      await loadArchivedData();
      onDataChange?.(); // Refresh parent dashboard data
      
      setConfirmRestore(null);
      showSuccess(
        `${userType.charAt(0).toUpperCase() + userType.slice(1)} restored successfully!`,
        'Restore Complete'
      );
    } catch (error) {
      console.error('Failed to restore user:', error);
      showError(
        error instanceof Error ? error.message : `Failed to restore ${userType}`,
        'Restore Failed'
      );
      setConfirmRestore(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentData = activeArchiveTab === 'admins' ? archivedAdmins : archivedBarbershops;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading archived data...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>🗄️ Archive Management</h2>
          <p>View and restore previously deleted users</p>
        </div>
        <div className={styles.archiveStats}>
          <span className={styles.statBadge}>
            📁 Archived Admins: {archivedAdmins.length}
          </span>
          <span className={styles.statBadge}>
            🏪 Archived Barbershops: {archivedBarbershops.length}
          </span>
        </div>
      </div>

      <div className={styles.archiveTabs}>
        <button 
          className={`${styles.archiveTab} ${activeArchiveTab === 'admins' ? styles.active : ''}`}
          onClick={() => setActiveArchiveTab('admins')}
        >
          📁 Archived Admins ({archivedAdmins.length})
        </button>
        <button 
          className={`${styles.archiveTab} ${activeArchiveTab === 'barbershops' ? styles.active : ''}`}
          onClick={() => setActiveArchiveTab('barbershops')}
        >
          🏪 Archived Barbershops ({archivedBarbershops.length})
        </button>
      </div>

      <div className={styles.archiveContent}>
        {currentData.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h3>No archived {activeArchiveTab}</h3>
            <p>All {activeArchiveTab} are currently active. Deleted {activeArchiveTab} will appear here.</p>
          </div>
        ) : (
          <div className={styles.archiveGrid}>
            {currentData.map((user) => (
              <Card key={user.id} className={styles.archiveCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {user.role === 'admin' ? '👤' : '✂️'}
                    </div>
                    <div className={styles.userDetails}>
                      <h3>{user.role === 'barbershop' ? user.shop_name || 'Unknown Shop' : user.name}</h3>
                      <p className={styles.userEmail}>{user.email}</p>
                      {user.role === 'barbershop' && user.shop_owner_name && (
                        <p className={styles.ownerName}>👤 {user.shop_owner_name}</p>
                      )}
                    </div>
                  </div>
                  <div className={styles.rolebadge}>
                    {user.role === 'admin' ? '👥 Admin' : '🏪 Barbershop'}
                  </div>
                </div>

                <div className={styles.archiveDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>🗑️ Deleted:</span>
                    <span>{formatDate(user.deleted_at)}</span>
                  </div>
                  {user.deleted_by && (
                    <div className={styles.detailItem}>
                      <span className={styles.label}>👤 Deleted by:</span>
                      <span>{user.deleted_by.name} ({user.deleted_by.email})</span>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <span className={styles.label}>📅 Originally created:</span>
                    <span>{formatDate(user.created_at)}</span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (confirmRestore === user.id) {
                        handleRestore(user.id, user.role);
                      } else {
                        setConfirmRestore(user.id);
                        // Auto-cancel confirmation after 5 seconds
                        setTimeout(() => setConfirmRestore(null), 5000);
                      }
                    }}
                    className={`${styles.restoreButton} ${confirmRestore === user.id ? styles.confirmRestore : ''}`}
                  >
                    {confirmRestore === user.id ? '⚠️ Confirm Restore' : '🔄 Restore'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchiveManagement;