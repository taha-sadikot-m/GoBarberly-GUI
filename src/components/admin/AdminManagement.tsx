import React, { useState, useEffect } from 'react';
import { Button, Input, Card } from '../ui';
import { type Admin } from '../../types/user';
import { superAdminService } from '../../services/superAdminApi';
import type { CreateAdminRequest as BackendCreateAdminRequest } from '../../services/superAdminApi';
import type { CreateAdminRequest } from '../../types/user';
import { UserRole } from '../../types/user';
import { useToast } from '../../context/ToastContext';
import AddAdminModal from './AddAdminModal';
import EditAdminModal from './EditAdminModal';
import TransferOwnershipModal from './TransferOwnershipModal';
import styles from './AdminManagement.module.css';

interface AdminManagementProps {
  // Props are now optional since the component will manage its own data
  onDataChange?: () => void; // Callback to notify parent of data changes
}

const AdminManagement: React.FC<AdminManagementProps> = ({
  onDataChange
}) => {
  const { showSuccess, showError, showWarning } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [transferOwnershipData, setTransferOwnershipData] = useState<{
    adminId: number;
    adminEmail: string;
    barbershopCount: number;
    barbershopNames: string[];
  } | null>(null);
  const [adminBarbershopCounts, setAdminBarbershopCounts] = useState<Record<string, number>>({});

  // Load admins from API
  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      
      const { admins: adminUsers } = await superAdminService.getAdmins();
      
      // Convert AdminUser[] to Admin[]
      const convertedAdmins: Admin[] = adminUsers.map(adminUser => ({
        id: adminUser.id.toString(),
        email: adminUser.email,
        name: `${adminUser.first_name} ${adminUser.last_name}`.trim(),
        role: UserRole.ADMIN,
        createdAt: new Date(adminUser.created_at),
        updatedAt: new Date(adminUser.updated_at),
        isActive: adminUser.is_active,
        createdBy: adminUser.created_by_name || '',
        managedBarbershops: [] // This would need separate API call if needed
      }));

      setAdmins(convertedAdmins);
      
      // Load barbershop counts for each admin
      await loadBarbershopCounts(adminUsers);
    } catch (error) {
      console.error('Failed to load admins:', error);
      showError('Failed to load admins. Please try again.', 'Loading Error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBarbershopCounts = async (adminUsers: any[]) => {
    try {
      const counts: Record<string, number> = {};
      
      // Load barbershop counts for each admin in parallel
      await Promise.all(
        adminUsers.map(async (admin) => {
          try {
            const { count } = await superAdminService.getAdminBarbershops(admin.id);
            counts[admin.id.toString()] = count;
          } catch (error) {
            console.warn(`Failed to load barbershop count for admin ${admin.id}:`, error);
            counts[admin.id.toString()] = 0;
          }
        })
      );
      
      setAdminBarbershopCounts(counts);
    } catch (error) {
      console.warn('Failed to load barbershop counts:', error);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async (adminData: CreateAdminRequest) => {
    try {
      // Convert frontend format to backend format
      const [firstName, ...lastNameParts] = adminData.name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      const backendData: BackendCreateAdminRequest = {
        email: adminData.email,
        first_name: firstName,
        last_name: lastName,
        password: adminData.password,
        password_confirm: adminData.password
      };
      
      await superAdminService.createAdmin(backendData);
      await loadAdmins(); // Reload the list
      onDataChange?.(); // Notify parent of data changes
      setShowAddModal(false);
      showSuccess(`Admin ${adminData.name} created successfully!`, 'Admin Created');
    } catch (error) {
      console.error('Failed to create admin:', error);
      showError(error instanceof Error ? error.message : 'Failed to create admin', 'Creation Failed');
    }
  };

  const handleUpdate = async (adminId: string, updates: any) => {
    try {
      await superAdminService.updateAdmin(parseInt(adminId), updates);
      await loadAdmins(); // Reload the list
      onDataChange?.(); // Notify parent of data changes
      setEditingAdmin(null);
      showSuccess('Admin updated successfully!', 'Update Complete');
    } catch (error) {
      console.error('Failed to update admin:', error);
      showError(error instanceof Error ? error.message : 'Failed to update admin', 'Update Failed');
    }
  };

  const handleDelete = async (adminId: string) => {
    const numericId = parseInt(adminId);
    
    if (confirmDelete === numericId) {
      try {
        await superAdminService.deleteAdmin(numericId);
        await loadAdmins(); // Reload the list
        onDataChange?.(); // Notify parent of data changes
        setConfirmDelete(null);
        showSuccess('Admin deleted successfully!', 'Deletion Complete');
      } catch (error: any) {
        console.error('Failed to delete admin:', error);
        
        // Check if this is a transfer ownership error
        if (error.response?.data?.data?.barbershop_count) {
          const errorData = error.response.data.data;
          setTransferOwnershipData({
            adminId: errorData.admin_id,
            adminEmail: errorData.admin_email,
            barbershopCount: errorData.barbershop_count,
            barbershopNames: errorData.barbershop_names || []
          });
          showWarning(
            `Admin has ${errorData.barbershop_count} barbershop(s). Transfer ownership required before deletion.`,
            'Transfer Required'
          );
        } else {
          showError(error instanceof Error ? error.message : 'Failed to delete admin', 'Deletion Failed');
        }
        setConfirmDelete(null);
      }
    } else {
      setConfirmDelete(numericId);
      // Clear confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const handleTransferOwnership = async (fromAdminId: number, toAdminId: number) => {
    try {
      const result = await superAdminService.transferAdminOwnership(fromAdminId, toAdminId);
      
      // Show success message
      showSuccess(
        `Successfully transferred ${result.transferred_count} barbershop(s) from ${result.from_admin} to ${result.to_admin}`,
        'Transfer Complete'
      );
      
      // Reload data
      await loadAdmins();
      onDataChange?.();
      
      // Close modal
      setTransferOwnershipData(null);
      
      // Now attempt to delete the admin
      setTimeout(() => {
        handleDelete(fromAdminId.toString());
      }, 1000);
      
    } catch (error) {
      console.error('Failed to transfer ownership:', error);
      showError(error instanceof Error ? error.message : 'Failed to transfer ownership', 'Transfer Failed');
    }
  };

  const toggleAdminStatus = async (admin: Admin) => {
    try {
      await superAdminService.toggleAdminStatus(parseInt(admin.id));
      await loadAdmins(); // Reload the list
      onDataChange?.(); // Notify parent of data changes
      showSuccess(
        `Admin ${admin.name} ${admin.isActive ? 'deactivated' : 'activated'} successfully!`,
        'Status Updated'
      );
    } catch (error) {
      console.error('Failed to toggle admin status:', error);
      showError(error instanceof Error ? error.message : 'Failed to toggle admin status', 'Status Update Failed');
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading admins...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>👥 Admin Management</h2>
          <p>Manage system administrators and their permissions</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className={styles.addButton}
        >
          ➕ Add New Admin
        </Button>
      </div>

      <div className={styles.controls}>
        <Input
          placeholder="Search admins by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.stats}>
          <span className={styles.statBadge}>
            Total: {admins.length}
          </span>
          <span className={styles.statBadge}>
            Active: {admins.filter(a => a.isActive).length}
          </span>
        </div>
      </div>

      <div className={styles.adminGrid}>
        {filteredAdmins.map((admin) => (
          <Card key={admin.id} className={styles.adminCard}>
            <div className={styles.adminHeader}>
              <div className={styles.adminAvatar}>
                {admin.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className={styles.adminInfo}>
                <h3>{admin.name}</h3>
                <p>{admin.email}</p>
              </div>
              <div className={styles.adminStatus}>
                <span 
                  className={`${styles.statusBadge} ${admin.isActive ? styles.active : styles.inactive}`}
                >
                  {admin.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className={styles.adminDetails}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Created:</span>
                <span>{admin.createdAt.toLocaleDateString()}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Barbershops:</span>
                <span>{adminBarbershopCounts[admin.id] || 0} shops</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Last Updated:</span>
                <span>{admin.updatedAt.toLocaleDateString()}</span>
              </div>
            </div>

            <div className={styles.adminActions}>
              <Button
                variant="ghost"
                onClick={() => setEditingAdmin(admin)}
                className={styles.editButton}
              >
                ✏️ Edit
              </Button>
              <Button
                variant="ghost"
                onClick={() => toggleAdminStatus(admin)}
                className={admin.isActive ? styles.deactivateButton : styles.activateButton}
              >
                {admin.isActive ? '🔒 Deactivate' : '🔓 Activate'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleDelete(admin.id)}
                className={`${styles.deleteButton} ${confirmDelete === parseInt(admin.id) ? styles.confirmDelete : ''}`}
              >
                {confirmDelete === parseInt(admin.id) ? '⚠️ Confirm Delete' : '🗑️ Delete'}
              </Button>
            </div>
          </Card>
        ))}

        {filteredAdmins.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👥</div>
            <h3>No admins found</h3>
            <p>
              {searchTerm 
                ? `No admins match "${searchTerm}"`
                : 'Get started by adding your first admin'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setShowAddModal(true)}
                className={styles.emptyButton}
              >
                Add First Admin
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <AddAdminModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <EditAdminModal
          admin={editingAdmin}
          onClose={() => setEditingAdmin(null)}
          onUpdate={handleUpdate}
        />
      )}

      {/* Transfer Ownership Modal */}
      {transferOwnershipData && (
        <TransferOwnershipModal
          isOpen={true}
          onClose={() => setTransferOwnershipData(null)}
          onTransfer={(toAdminId) => handleTransferOwnership(transferOwnershipData.adminId, toAdminId)}
          sourceAdmin={transferOwnershipData}
        />
      )}
    </div>
  );
};

export default AdminManagement;