import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Card } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { superAdminService } from '../../services/superAdminApi';
import { adminService } from '../../services/adminApi';
import type { BarbershopUser as SuperAdminBarbershopUser, CreateBarbershopRequest as BackendCreateBarbershopRequest } from '../../services/superAdminApi';
import type { BarbershopUser as AdminBarbershopUser } from '../../services/adminApi';
import type { CreateBarbershopRequest } from '../../types/user';

type BarbershopUser = SuperAdminBarbershopUser | AdminBarbershopUser;
import AddBarbershopModal from './AddBarbershopModal';
import EditBarbershopModal from './EditBarbershopModal';
import TransferBarbershopModal from './TransferBarbershopModal';
import styles from './BarbershopManagement.module.css';

interface BarbershopManagementProps {
  onDataChange?: () => void; // Optional callback to notify parent of data changes
}

const BarbershopManagement: React.FC<BarbershopManagementProps> = ({
  onDataChange
}) => {
  const { state } = useAuth();
  const { showSuccess, showError } = useToast();
  const [barbershops, setBarbershops] = useState<BarbershopUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBarbershop, setEditingBarbershop] = useState<BarbershopUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [transferringBarbershop, setTransferringBarbershop] = useState<BarbershopUser | null>(null);
  
  // Ref to track if component is mounted (prevent state updates after unmount)
  const isMountedRef = useRef(true);

  // Get the appropriate service based on user role
  const getApiService = () => {
    return state.user?.role === 'super_admin' ? superAdminService : adminService;
  };

  // Load barbershops data from API
  const loadBarbershops = async () => {
    try {
      // Prevent duplicate loading if already loading
      if (isLoading) {
        console.log('⏳ Already loading barbershops, skipping duplicate request');
        return;
      }
      
      setIsLoading(true);
      
      console.log('🔍 Loading barbershops for user role:', state.user?.role);
      
      const apiService = getApiService();
      const barbershopsData = await apiService.getBarbershops();
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        console.log('✅ Loaded barbershops:', barbershopsData);
        console.log('🔍 Barbershops data structure:', {
          fullResponse: barbershopsData,
          barbershopsArray: barbershopsData.barbershops,
          barbershopsLength: barbershopsData.barbershops?.length,
          barbershopsType: typeof barbershopsData.barbershops,
          isArray: Array.isArray(barbershopsData.barbershops)
        });
        setBarbershops(barbershopsData.barbershops);
        console.log('📊 Set barbershops state:', barbershopsData.barbershops?.length, 'items');
      }
    } catch (error: any) {
      console.error('❌ Failed to load barbershops:', error);
      
      // Only show error and update state if component is still mounted
      if (isMountedRef.current) {
        // Only show error if we don't have existing data (to handle timeout scenarios where data still loads)
        if (barbershops.length === 0) {
          // More specific error messages
          let errorMessage = 'Failed to load barbershops. Please try again.';
          if (error?.message?.includes('timeout')) {
            errorMessage = 'Request timed out. The data may still be loading. Please refresh if barbershops are not visible.';
          } else if (error?.message?.includes('Network Error')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          }
          
          showError(errorMessage, 'Loading Error');
        } else {
          console.log('ℹ️ Error occurred but existing data available, not showing error toast');
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Load data on component mount and cleanup on unmount
  useEffect(() => {
    loadBarbershops();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleAdd = async (barbershopData: CreateBarbershopRequest) => {
    try {
      // Convert frontend format to backend format
      const backendData: BackendCreateBarbershopRequest = {
        email: barbershopData.email,
        shop_name: barbershopData.shopName,
        shop_owner_name: barbershopData.shopOwnerName,
        shop_logo: barbershopData.shopLogo,
        address: barbershopData.address,
        phone_number: barbershopData.phone,
        password: barbershopData.password,
        password_confirm: barbershopData.password,
        subscription_plan: 'basic' // Default plan
      };
      
      const apiService = getApiService();
      await apiService.createBarbershop(backendData);
      await loadBarbershops(); // Reload the list
      onDataChange?.(); // Notify parent of data changes
      setShowAddModal(false);
      showSuccess(`Barbershop "${barbershopData.shopName}" created successfully!`, 'Barbershop Created');
    } catch (error) {
      console.error('Failed to create barbershop:', error);
      showError(error instanceof Error ? error.message : 'Failed to create barbershop', 'Creation Failed');
    }
  };

  const handleUpdate = async (barbershopId: string, updates: any) => {
    try {
      const apiService = getApiService();
      await apiService.updateBarbershop(parseInt(barbershopId), updates);
      await loadBarbershops(); // Reload the list
      onDataChange?.(); // Notify parent of data changes
      setEditingBarbershop(null);
      showSuccess('Barbershop updated successfully!', 'Update Complete');
    } catch (error) {
      console.error('Failed to update barbershop:', error);
      showError(error instanceof Error ? error.message : 'Failed to update barbershop', 'Update Failed');
    }
  };

  const handleDelete = async (barbershopId: string) => {
    try {
      const apiService = getApiService();
      const barbershop = barbershops.find(b => b.id === parseInt(barbershopId));
      
      // Check if barbershop has active account and subscription before attempting deletion
      if (barbershop?.is_active && 
          barbershop?.subscription?.status === 'active' && 
          barbershop?.subscription?.expires_at && 
          new Date(barbershop.subscription.expires_at) > new Date()) {
        showError(
          'Cannot delete barbershop with active account and subscription. Please deactivate the account first.',
          'Active Account & Subscription'
        );
        setConfirmDelete(null);
        return;
      }
      
      await apiService.deleteBarbershop(parseInt(barbershopId));
      await loadBarbershops(); // Reload the list
      onDataChange?.(); // Notify parent of data changes
      setConfirmDelete(null);
      showSuccess(`Barbershop "${barbershop?.shop_name || 'Unknown'}" deleted successfully!`, 'Deletion Complete');
    } catch (error) {
      console.error('Failed to delete barbershop:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete barbershop';
      
      // Handle specific error cases
      if (errorMessage.includes('active subscription') || errorMessage.includes('active account')) {
        showError(
          'Cannot delete barbershop with active account and subscription. Please deactivate the account first.',
          'Active Account Error'
        );
      } else {
        showError(errorMessage, 'Deletion Failed');
      }
      setConfirmDelete(null);
    }
  };

  const toggleBarbershopStatus = async (barbershop: BarbershopUser) => {
    try {
      const apiService = getApiService();
      await apiService.updateBarbershop(barbershop.id, { 
        is_active: !barbershop.is_active 
      });
      await loadBarbershops(); // Reload the list
      onDataChange?.(); // Notify parent of data changes
      showSuccess(
        `Barbershop "${barbershop.shop_name}" ${barbershop.is_active ? 'deactivated' : 'activated'} successfully!`,
        'Status Updated'
      );
    } catch (error) {
      console.error('Failed to toggle barbershop status:', error);
      showError(error instanceof Error ? error.message : 'Failed to toggle barbershop status', 'Status Update Failed');
    }
  };

  const handleTransferOwnership = async (barbershopId: number, toAdminId: number) => {
    try {
      // Both admin and super admin can use transfer functionality
      if (!state.user?.role || !['admin', 'super_admin'].includes(state.user.role)) {
        showError('Transfer functionality is only available for admin and super admin users', 'Access Denied');
        return;
      }
      
      // Always use adminService for transfer operations (same API endpoints)
      const result = await adminService.transferBarbershopOwnership(barbershopId, toAdminId);
      
      await loadBarbershops(); // Reload the list
      onDataChange?.(); // Notify parent of data changes
      setTransferringBarbershop(null);
      
      showSuccess(
        result.message || `Barbershop transferred successfully!`,
        'Transfer Complete'
      );
    } catch (error) {
      console.error('Failed to transfer barbershop:', error);
      showError(
        error instanceof Error ? error.message : 'Failed to transfer barbershop ownership',
        'Transfer Failed'
      );
      setTransferringBarbershop(null);
    }
  };

  const filteredBarbershops = barbershops.filter(barbershop =>
    (barbershop.shop_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (barbershop.shop_owner_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (barbershop.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  console.log('🎯 Render Debug:', {
    barbershopsState: barbershops,
    barbershopsLength: barbershops.length,
    filteredBarbershopsLength: filteredBarbershops.length,
    isLoading,
    searchTerm,
    userRole: state.user?.role
  });

  if (isLoading) {
    return <div className={styles.loading}>Loading barbershops...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'suspended': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>✂️ Barbershop Management</h2>
          <p>Manage barbershop accounts and monitor their performance</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className={styles.addButton}
        >
          🏪 Add New Barbershop
        </Button>
      </div>

      <div className={styles.controls}>
        <Input
          placeholder="Search barbershops by name, owner, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.stats}>
          <span className={styles.statBadge}>
            Total: {barbershops.length}
          </span>
          <span className={styles.statBadge}>
            Active: {barbershops.filter(b => b.is_active).length}
          </span>
        </div>
      </div>

      <div className={styles.barbershopGrid}>
        {filteredBarbershops.map((barbershop) => (
          <Card key={barbershop.id} className={styles.barbershopCard}>
            <div className={styles.barbershopHeader}>
              <div className={styles.shopLogo}>
                {barbershop.shop_logo ? (
                  <img src={barbershop.shop_logo} alt={barbershop.shop_name || 'Barbershop logo'} />
                ) : (
                  <div className={styles.logoPlaceholder}>
                    {(barbershop.shop_name || 'Unknown Shop').split(' ').map((word: string) => word[0]).join('').toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.shopInfo}>
                <h3>{barbershop.shop_name || 'Unknown Shop'}</h3>
                <p>👤 {barbershop.shop_owner_name || 'Unknown Owner'}</p>
                <p>📧 {barbershop.email || 'No email provided'}</p>
              </div>
              <div className={styles.shopStatus}>
                <span 
                  className={`${styles.statusBadge} ${barbershop.is_active ? styles.active : styles.inactive}`}
                >
                  {barbershop.is_active ? '✅ Active' : '❌ Inactive'}
                </span>
                {barbershop.subscription && (
                  <span 
                    className={`${styles.subscriptionBadge} ${styles[getStatusColor(barbershop.subscription.status)]}`}
                    title={`Plan: ${barbershop.subscription.plan}, Status: ${barbershop.subscription.status}, Expires: ${new Date(barbershop.subscription.expires_at).toLocaleDateString()}`}
                  >
                    {barbershop.subscription.plan} - {barbershop.subscription.status}
                    {barbershop.subscription.status === 'active' && 
                     barbershop.subscription.expires_at && 
                     new Date(barbershop.subscription.expires_at) > new Date() && (
                      <span className={styles.activeIndicator}>🔒</span>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.shopDetails}>
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
                <span className={styles.label}>📅 Created:</span>
                <span>{new Date(barbershop.created_at).toLocaleDateString()}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>👤 Added by:</span>
                <span>{barbershop.created_by_name || 'Unknown'}</span>
              </div>
              {barbershop.subscription && (
                <div className={styles.detailItem}>
                  <span className={styles.label}>⏰ Subscription Expires:</span>
                  <span>{new Date(barbershop.subscription.expires_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className={styles.shopActions}>
              <Button
                variant="ghost"
                onClick={() => setEditingBarbershop(barbershop)}
                className={styles.editButton}
              >
                ✏️ Edit
              </Button>
              <Button
                variant="ghost"
                onClick={() => toggleBarbershopStatus(barbershop)}
                className={barbershop.is_active ? styles.deactivateButton : styles.activateButton}
              >
                {barbershop.is_active ? '🔒 Deactivate' : '🔓 Activate'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setTransferringBarbershop(barbershop)}
                className={styles.transferButton}
                title="Transfer ownership to another admin"
              >
                🔄 Transfer
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (confirmDelete === barbershop.id) {
                    handleDelete(barbershop.id.toString());
                  } else {
                    setConfirmDelete(barbershop.id);
                    // Auto-cancel confirmation after 5 seconds
                    setTimeout(() => setConfirmDelete(null), 5000);
                  }
                }}
                className={`${styles.deleteButton} ${confirmDelete === barbershop.id ? styles.confirmDelete : ''}`}
                disabled={!!(barbershop.is_active && 
                         barbershop.subscription?.status === 'active' && 
                         barbershop.subscription?.expires_at && 
                         new Date(barbershop.subscription.expires_at) > new Date())}
                title={
                  (barbershop.is_active && 
                   barbershop.subscription?.status === 'active' && 
                   barbershop.subscription?.expires_at && 
                   new Date(barbershop.subscription.expires_at) > new Date()) 
                    ? 'Cannot delete barbershop with active account and subscription. Deactivate first.' 
                    : 'Delete this barbershop'
                }
              >
                {confirmDelete === barbershop.id ? '⚠️ Confirm Delete' : '🗑️ Delete'}
              </Button>
            </div>
          </Card>
        ))}

        {filteredBarbershops.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✂️</div>
            <h3>No barbershops found</h3>
            <p>
              {searchTerm 
                ? `No barbershops match "${searchTerm}"`
                : 'Get started by adding your first barbershop'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setShowAddModal(true)}
                className={styles.emptyButton}
              >
                Add First Barbershop
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Barbershop Modal */}
      {showAddModal && (
        <AddBarbershopModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}

      {/* Edit Barbershop Modal */}
      {editingBarbershop && (
        <EditBarbershopModal
          barbershop={{
            id: editingBarbershop.id.toString(),
            email: editingBarbershop.email,
            name: editingBarbershop.shop_owner_name,
            role: 'barbershop' as const,
            createdAt: new Date(editingBarbershop.created_at),
            updatedAt: new Date(editingBarbershop.updated_at),
            isActive: editingBarbershop.is_active,
            shopName: editingBarbershop.shop_name,
            shopOwnerName: editingBarbershop.shop_owner_name,
            shopLogo: editingBarbershop.shop_logo,
            address: editingBarbershop.address,
            phone: editingBarbershop.phone_number,
            createdBy: editingBarbershop.created_by_name || 'Unknown',
            subscription: editingBarbershop.subscription ? {
              plan: editingBarbershop.subscription.plan,
              status: (editingBarbershop.subscription.status === 'expired' ? 'inactive' : editingBarbershop.subscription.status) as 'active' | 'inactive' | 'suspended',
              expiresAt: new Date(editingBarbershop.subscription.expires_at)
            } : undefined
          }}
          onClose={() => setEditingBarbershop(null)}
          onUpdate={handleUpdate}
        />
      )}

      {/* Transfer Barbershop Modal */}
      {transferringBarbershop && (
        <TransferBarbershopModal
          barbershop={transferringBarbershop}
          onClose={() => setTransferringBarbershop(null)}
          onTransfer={handleTransferOwnership}
        />
      )}
    </div>
  );
};

export default BarbershopManagement;