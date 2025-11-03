import React, { useState, useEffect } from 'react';
import { Button, Modal, Select } from '../ui';
import { superAdminService } from '../../services/superAdminApi';
import type { AdminUser } from '../../services/superAdminApi';
import styles from './TransferOwnershipModal.module.css';

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (toAdminId: number) => void;
  sourceAdmin: {
    adminId: number;
    adminEmail: string;
    barbershopCount: number;
    barbershopNames: string[];
  };
}

const TransferOwnershipModal: React.FC<TransferOwnershipModalProps> = ({
  isOpen,
  onClose,
  onTransfer,
  sourceAdmin
}) => {
  const [availableAdmins, setAvailableAdmins] = useState<AdminUser[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAvailableAdmins();
    }
  }, [isOpen, sourceAdmin.adminId]);

  const loadAvailableAdmins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { admins } = await superAdminService.getAdmins();
      
      // Filter out the source admin and inactive admins
      const availableAdmins = admins.filter(admin => 
        admin.id !== sourceAdmin.adminId && admin.is_active
      );
      
      setAvailableAdmins(availableAdmins);
      
      if (availableAdmins.length === 0) {
        setError('No other active admins available for transfer');
      }
    } catch (error) {
      console.error('Failed to load available admins:', error);
      setError('Failed to load available admins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedAdminId) {
      setError('Please select a target admin');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onTransfer(selectedAdminId);
    } catch (error) {
      setError('Transfer failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAdmin = availableAdmins.find(admin => admin.id === selectedAdminId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfer Barbershop Ownership">
      <div className={styles.container}>
        <div className={styles.warning}>
          <div className={styles.warningIcon}>⚠️</div>
          <div className={styles.warningContent}>
            <h3>Transfer Required</h3>
            <p>
              Cannot delete admin <strong>{sourceAdmin.adminEmail}</strong> because they have created{' '}
              <strong>{sourceAdmin.barbershopCount} barbershop(s)</strong>.
            </p>
            <p>You must transfer ownership to another admin first.</p>
          </div>
        </div>

        {sourceAdmin.barbershopNames.length > 0 && (
          <div className={styles.barbershopsPreview}>
            <h4>Barbershops to transfer:</h4>
            <ul>
              {sourceAdmin.barbershopNames.map((name, index) => (
                <li key={index}>{name || 'Unnamed Shop'}</li>
              ))}
              {sourceAdmin.barbershopCount > sourceAdmin.barbershopNames.length && (
                <li>... and {sourceAdmin.barbershopCount - sourceAdmin.barbershopNames.length} more</li>
              )}
            </ul>
          </div>
        )}

        <div className={styles.transferSection}>
          <h4>Select target admin:</h4>
          {isLoading ? (
            <div className={styles.loading}>Loading available admins...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <Select
              value={selectedAdminId?.toString() || ''}
              onChange={(e) => setSelectedAdminId(e.target.value ? parseInt(e.target.value) : null)}
              className={styles.adminSelect}
              options={[
                { value: '', label: 'Select an admin...' },
                ...availableAdmins.map((admin) => ({
                  value: admin.id.toString(),
                  label: `${admin.first_name} ${admin.last_name} (${admin.email})`
                }))
              ]}
            />
          )}

          {selectedAdmin && (
            <div className={styles.confirmationBox}>
              <div className={styles.confirmationIcon}>🔄</div>
              <div className={styles.confirmationText}>
                <p>
                  <strong>{sourceAdmin.barbershopCount} barbershop(s)</strong> will be transferred from:
                </p>
                <div className={styles.transferArrow}>
                  <div className={styles.adminBox}>
                    <strong>From:</strong> {sourceAdmin.adminEmail}
                  </div>
                  <div className={styles.arrow}>→</div>
                  <div className={styles.adminBox}>
                    <strong>To:</strong> {selectedAdmin.first_name} {selectedAdmin.last_name}<br />
                    ({selectedAdmin.email})
                  </div>
                </div>
                <p className={styles.note}>
                  After the transfer, admin <strong>{sourceAdmin.adminEmail}</strong> will be deleted.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!selectedAdminId || isLoading || availableAdmins.length === 0}
            className={styles.transferButton}
          >
            {isLoading ? 'Transferring...' : 'Transfer & Delete Admin'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TransferOwnershipModal;