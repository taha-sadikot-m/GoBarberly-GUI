import React, { useState, useEffect } from 'react';
import { Modal, Button, Select } from '../ui';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/adminApi';
import type { BarbershopUser } from '../../services/adminApi';
import styles from './TransferBarbershopModal.module.css';

interface Admin {
  id: number;
  name: string;
  email: string;
  display_name: string;
}

interface TransferBarbershopModalProps {
  barbershop: BarbershopUser;
  onClose: () => void;
  onTransfer: (barbershopId: number, toAdminId: number) => Promise<void>;
}

const TransferBarbershopModal: React.FC<TransferBarbershopModalProps> = ({
  barbershop,
  onClose,
  onTransfer
}) => {
  const { showError } = useToast();
  const [availableAdmins, setAvailableAdmins] = useState<Admin[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    loadAvailableAdmins();
  }, []);

  const loadAvailableAdmins = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading available admins for transfer...');
      const { admins } = await adminService.getAvailableAdminsForTransfer();
      console.log('✅ Available admins loaded:', admins);
      setAvailableAdmins(admins);
    } catch (error: any) {
      console.error('❌ Failed to load available admins:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load available admins';
      if (error?.message?.includes('Authentication') || error?.message?.includes('401')) {
        errorMessage = 'Please log in again to access this feature';
      } else if (error?.message?.includes('permission') || error?.message?.includes('403')) {
        errorMessage = 'You do not have permission to transfer barbershops';
      } else if (error?.message?.includes('Network Error')) {
        errorMessage = 'Network error - please check your connection and try again';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage, 'Loading Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedAdminId) {
      showError('Please select an admin to transfer to', 'Selection Required');
      return;
    }

    try {
      setIsTransferring(true);
      await onTransfer(barbershop.id, parseInt(selectedAdminId));
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsTransferring(false);
    }
  };

  const selectedAdmin = availableAdmins.find(admin => admin.id.toString() === selectedAdminId);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="🔄 Transfer Barbershop Ownership"
    >
      <div className={styles.container}>
        <div className={styles.barbershopInfo}>
          <h4>📍 Barbershop Details</h4>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Shop Name:</span>
              <span className={styles.value}>{barbershop.shop_name || 'Unknown Shop'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Owner:</span>
              <span className={styles.value}>{barbershop.shop_owner_name || 'Unknown Owner'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{barbershop.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Currently Managed By:</span>
              <span className={styles.value}>{barbershop.created_by_name || 'Unknown'}</span>
            </div>
          </div>
        </div>

        <div className={styles.transferSection}>
          <h4>👤 Transfer To</h4>
          {isLoading ? (
            <div className={styles.loading}>Loading available admins...</div>
          ) : availableAdmins.length === 0 ? (
            <div className={styles.noAdmins}>
              <p>No other admins available for transfer.</p>
            </div>
          ) : (
            <>
              <Select
                value={selectedAdminId}
                onChange={(e) => setSelectedAdminId(e.target.value)}
                className={styles.adminSelect}
                options={[
                  { value: '', label: '-- Select Admin --' },
                  ...availableAdmins.map((admin) => ({
                    value: admin.id.toString(),
                    label: admin.display_name
                  }))
                ]}
              />
              
              {selectedAdmin && (
                <div className={styles.selectedAdminPreview}>
                  <h5>Selected Admin:</h5>
                  <div className={styles.adminCard}>
                    <div className={styles.adminInfo}>
                      <span className={styles.adminName}>{selectedAdmin.name}</span>
                      <span className={styles.adminEmail}>{selectedAdmin.email}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {selectedAdminId && (
          <div className={styles.warningSection}>
            <div className={styles.warning}>
              <h5>⚠️ Transfer Confirmation</h5>
              <p>
                You are about to transfer ownership of <strong>"{barbershop.shop_name}"</strong> to{' '}
                <strong>{selectedAdmin?.name}</strong>.
              </p>
              <p>
                After the transfer:
              </p>
              <ul>
                <li>You will no longer have management access to this barbershop</li>
                <li>The selected admin will become the new owner</li>
                <li>All existing data and settings will remain intact</li>
                <li>This action cannot be undone without contacting a super admin</li>
              </ul>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isTransferring}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!selectedAdminId || isTransferring || availableAdmins.length === 0}
            className={styles.transferButton}
          >
            {isTransferring ? '🔄 Transferring...' : '✅ Confirm Transfer'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TransferBarbershopModal;