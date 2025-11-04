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
  // Start with not-loading so the first loadBarbershops() call is not skipped
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBarbershop, setEditingBarbershop] = useState<BarbershopUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [transferringBarbershop, setTransferringBarbershop] = useState<BarbershopUser | null>(null);
  
  // Ref to track if component is mounted (prevent state updates after unmount)
  const isMountedRef = useRef(true);
  // Ref to track in-flight fetches (avoid using state for this guard to prevent race)
  const isFetchingRef = useRef(false);

  // Log component initialization
  console.log(`[BarbershopManagement-${state.user?.role}] 🏗️ Component initializing...`);

  // Get the appropriate service based on user role
  const getApiService = () => {
    return state.user?.role === 'super_admin' ? superAdminService : adminService;
  };

  // REWRITTEN: Load barbershops data from API with comprehensive error handling and logging
  const loadBarbershops = async (retryCount = 0) => {
    const maxRetries = 2;
    const logPrefix = `[BarbershopManagement-${state.user?.role}]`;
    
    // Check if component is still mounted before starting
    if (!isMountedRef.current) {
      console.log(`${logPrefix} ⚠️ Component unmounted before load started, aborting`);
      return;
    }
    
    try {
      // Prevent duplicate loading using an in-flight ref (state can lag during render)
      if (isFetchingRef.current) {
        console.log(`${logPrefix} ⏳ Already loading barbershops (in-flight), skipping duplicate request`);
        return;
      }

      // mark as fetching immediately
      isFetchingRef.current = true;

      console.log(`${logPrefix} 🚀 Starting barbershop load (attempt ${retryCount + 1}/${maxRetries + 1})`);
      console.log(`${logPrefix} 👤 User: ${state.user?.email} (Role: ${state.user?.role})`);
      
  setIsLoading(true);
      
      // Get appropriate API service
      const apiService = getApiService();
      const serviceName = state.user?.role === 'super_admin' ? 'SuperAdminService' : 'AdminService';
      console.log(`${logPrefix} 🔧 Using ${serviceName}`);
      
      // Clear any existing errors
      console.log(`${logPrefix} 🧹 Clearing previous barbershop data`);
      
      // Make API call with detailed timing
      const startTime = Date.now();
      console.log(`${logPrefix} 📡 Making API call...`);
      
      const barbershopsData = await apiService.getBarbershops({});
      
      const loadTime = Date.now() - startTime;
      console.log(`${logPrefix} ⏱️ API call completed in ${loadTime}ms`);
      
      // Validate response
      if (!barbershopsData) {
        throw new Error('No data received from API');
      }
      
      if (!barbershopsData.barbershops) {
        throw new Error('No barbershops array in response');
      }
      
      if (!Array.isArray(barbershopsData.barbershops)) {
        throw new Error(`Invalid barbershops data type: ${typeof barbershopsData.barbershops}`);
      }
      
      console.log(`${logPrefix} ✅ API Response validated successfully`);
      console.log(`${logPrefix} 📊 Response details:`, {
        barbershopsCount: barbershopsData.barbershops.length,
        totalCount: barbershopsData.count,
        hasData: barbershopsData.barbershops.length > 0,
        sampleBarbershop: barbershopsData.barbershops[0] ? {
          id: barbershopsData.barbershops[0].id,
          shopName: barbershopsData.barbershops[0].shop_name,
          email: barbershopsData.barbershops[0].email,
          isActive: barbershopsData.barbershops[0].is_active
        } : null
      });
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        console.log(`${logPrefix} 🔄 Updating component state with ${barbershopsData.barbershops.length} barbershops`);
        setBarbershops(barbershopsData.barbershops);
        
        // Show success message for significant loads
        if (barbershopsData.barbershops.length > 0) {
          console.log(`${logPrefix} 🎉 SUCCESS: Loaded ${barbershopsData.barbershops.length} barbershops`);
          
          // Show success toast for first load or significant changes
          if (barbershops.length === 0 || Math.abs(barbershops.length - barbershopsData.barbershops.length) > 0) {
            showSuccess(
              `Loaded ${barbershopsData.barbershops.length} barbershop${barbershopsData.barbershops.length === 1 ? '' : 's'}`,
              'Data Loaded'
            );
          }
        } else {
          console.log(`${logPrefix} ℹ️ No barbershops found for user ${state.user?.email}`);
        }
      } else {
        console.log(`${logPrefix} ⚠️ Component unmounted, skipping state update`);
      }
      
  } catch (error: any) {
      console.error(`${logPrefix} ❌ BARBERSHOP LOAD ERROR (attempt ${retryCount + 1}):`, error);
      console.error(`${logPrefix} 📋 Error details:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });
      
      // Only handle error if component is still mounted
      if (isMountedRef.current) {
        // Determine if we should retry
        const shouldRetry = retryCount < maxRetries && (
          error.code === 'ECONNABORTED' || // Timeout
          error.code === 'NETWORK_ERROR' || // Network error
          error.response?.status >= 500 // Server error
        );
        
        if (shouldRetry) {
          console.log(`${logPrefix} 🔄 Retrying in 2 seconds (attempt ${retryCount + 2}/${maxRetries + 1})`);
          setTimeout(() => {
            if (isMountedRef.current) {
              loadBarbershops(retryCount + 1);
            }
          }, 2000);
          return;
        }
        
        // Generate user-friendly error message
        let errorMessage = 'Unable to load barbershops';
        let errorTitle = 'Loading Error';
        
        if (error.message.includes('Authentication failed')) {
          errorMessage = 'Your session has expired. Please login again.';
          errorTitle = 'Authentication Error';
        } else if (error.message.includes('Access denied')) {
          errorMessage = 'You do not have permission to view barbershops.';
          errorTitle = 'Access Denied';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'The request timed out. Please check your internet connection and try again.';
          errorTitle = 'Connection Timeout';
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Network connection error. Please check your internet connection.';
          errorTitle = 'Network Error';
        } else if (error.response?.status >= 500) {
          errorMessage = 'Server error. Please try again in a few moments.';
          errorTitle = 'Server Error';
        } else if (error.response?.status === 404) {
          errorMessage = 'Barbershops service not found. Please contact support.';
          errorTitle = 'Service Error';
        }
        
        // Show error only if we don't have existing data
        if (barbershops.length === 0) {
          console.log(`${logPrefix} 🔔 Showing error to user: ${errorMessage}`);
          showError(errorMessage, errorTitle);
        } else {
          console.log(`${logPrefix} ℹ️ Error occurred but existing data available, showing warning`);
          showError(
            `Unable to refresh barbershops: ${errorMessage}`,
            'Refresh Error'
          );
        }
      }
      
    } finally {
      // reset fetching ref and loading state
      isFetchingRef.current = false;
      if (isMountedRef.current) {
        console.log(`${logPrefix} 🏁 Setting loading to false`);
        setIsLoading(false);
      }
    }
  };

  // Load data on component mount and cleanup on unmount
  useEffect(() => {
    console.log(`[BarbershopManagement-${state.user?.role}] 🔄 Component mounted, starting initial load`);
    isMountedRef.current = true; // Ensure it's set to true on mount
    loadBarbershops();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      console.log(`[BarbershopManagement-${state.user?.role}] 🔄 Component unmounting, setting mounted ref to false`);
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