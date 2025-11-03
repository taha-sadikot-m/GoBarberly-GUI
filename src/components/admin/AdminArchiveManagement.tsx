import React, { useState, useEffect } from 'react';
import { Card, Button } from '../ui';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/adminApi';
import styles from './AdminArchiveManagement.module.css';

interface ArchivedBarbershop {
  id: number;
  email: string;
  shop_name: string;
  shop_owner_name: string;
  shop_logo?: string;
  address?: string;
  phone_number?: string;
  deleted_at: string;
  deleted_by: {
    id: number;
    name: string;
    email: string;
  } | null;
  created_at: string;
}

interface AdminArchiveManagementProps {
  onDataChange?: () => void;
}

const AdminArchiveManagement: React.FC<AdminArchiveManagementProps> = ({ onDataChange }) => {
  const { showSuccess, showError } = useToast();
  const [archivedBarbershops, setArchivedBarbershops] = useState<ArchivedBarbershop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmRestore, setConfirmRestore] = useState<number | null>(null);

  useEffect(() => {
    loadArchivedData();
  }, []);

  const loadArchivedData = async () => {
    try {
      setIsLoading(true);
      
      // Load archived barbershops for this admin
      const archivedBarbershopsData = await adminService.getArchivedBarbershops();
      const mappedBarbershops: ArchivedBarbershop[] = (archivedBarbershopsData.barbershops || []).map((barbershop: any) => ({
        id: barbershop.id,
        email: barbershop.email,
        shop_name: barbershop.shop_name,
        shop_owner_name: barbershop.shop_owner_name,
        shop_logo: barbershop.shop_logo,
        address: barbershop.address,
        phone_number: barbershop.phone_number,
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

  const handleRestore = async (barbershopId: number) => {
    try {
      await adminService.restoreBarbershop(barbershopId);
      
      // Reload data
      await loadArchivedData();
      onDataChange?.(); // Refresh parent dashboard data
      
      setConfirmRestore(null);
      showSuccess('Barbershop restored successfully!', 'Restore Complete');
    } catch (error) {
      console.error('Failed to restore barbershop:', error);
      showError(
        error instanceof Error ? error.message : 'Failed to restore barbershop',
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

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading archived barbershops...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>🗄️ Archived Barbershops</h2>
          <p>View and restore previously deleted barbershops you created</p>
        </div>
        <div className={styles.archiveStats}>
          <span className={styles.statBadge}>
            📁 Archived: {archivedBarbershops.length}
          </span>
        </div>
      </div>

      <div className={styles.archiveContent}>
        {archivedBarbershops.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h3>No archived barbershops</h3>
            <p>All your barbershops are currently active. Deleted barbershops will appear here.</p>
          </div>
        ) : (
          <div className={styles.archiveGrid}>
            {archivedBarbershops.map((barbershop) => (
              <Card key={barbershop.id} className={styles.archiveCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.shopInfo}>
                    <div className={styles.shopLogo}>
                      {barbershop.shop_logo ? (
                        <img src={barbershop.shop_logo} alt={barbershop.shop_name || 'Barbershop logo'} />
                      ) : (
                        <div className={styles.logoPlaceholder}>
                          {(barbershop.shop_name || 'Unknown Shop').split(' ').map((word: string) => word[0]).join('').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className={styles.shopDetails}>
                      <h3>{barbershop.shop_name || 'Unknown Shop'}</h3>
                      <p className={styles.shopEmail}>{barbershop.email}</p>
                      {barbershop.shop_owner_name && (
                        <p className={styles.ownerName}>👤 {barbershop.shop_owner_name}</p>
                      )}
                    </div>
                  </div>
                  <div className={styles.statusBadge}>
                    🏪 Barbershop
                  </div>
                </div>

                <div className={styles.archiveDetails}>
                  {barbershop.address && (
                    <div className={styles.detailItem}>
                      <span className={styles.label}>📍 Address:</span>
                      <span>{barbershop.address}</span>
                    </div>
                  )}
                  {barbershop.phone_number && (
                    <div className={styles.detailItem}>
                      <span className={styles.label}>📞 Phone:</span>
                      <span>{barbershop.phone_number}</span>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <span className={styles.label}>🗑️ Deleted:</span>
                    <span>{formatDate(barbershop.deleted_at)}</span>
                  </div>
                  {barbershop.deleted_by && (
                    <div className={styles.detailItem}>
                      <span className={styles.label}>👤 Deleted by:</span>
                      <span>{barbershop.deleted_by.name} ({barbershop.deleted_by.email})</span>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <span className={styles.label}>📅 Originally created:</span>
                    <span>{formatDate(barbershop.created_at)}</span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (confirmRestore === barbershop.id) {
                        handleRestore(barbershop.id);
                      } else {
                        setConfirmRestore(barbershop.id);
                        // Auto-cancel confirmation after 5 seconds
                        setTimeout(() => setConfirmRestore(null), 5000);
                      }
                    }}
                    className={`${styles.restoreButton} ${confirmRestore === barbershop.id ? styles.confirmRestore : ''}`}
                  >
                    {confirmRestore === barbershop.id ? '⚠️ Confirm Restore' : '🔄 Restore'}
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

export default AdminArchiveManagement;