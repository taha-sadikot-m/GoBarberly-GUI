import React, { useState } from 'react';
import { Button, Input, Card } from '../ui';
import { type Admin } from '../../types/user';
import AddAdminModal from './AddAdminModal';
import EditAdminModal from './EditAdminModal';
import styles from './AdminManagement.module.css';

interface AdminManagementProps {
  admins: Admin[];
  onAdd: (adminData: any) => void;
  onUpdate: (adminId: string, updates: any) => void;
  onDelete: (adminId: string) => void;
}

const AdminManagement: React.FC<AdminManagementProps> = ({
  admins,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (adminId: string) => {
    if (confirmDelete === adminId) {
      onDelete(adminId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(adminId);
      // Clear confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const toggleAdminStatus = (admin: Admin) => {
    onUpdate(admin.id, { isActive: !admin.isActive });
  };

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
                <span>{admin.managedBarbershops.length} shops</span>
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
                className={`${styles.deleteButton} ${confirmDelete === admin.id ? styles.confirmDelete : ''}`}
              >
                {confirmDelete === admin.id ? '⚠️ Confirm Delete' : '🗑️ Delete'}
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
          onAdd={onAdd}
        />
      )}

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <EditAdminModal
          admin={editingAdmin}
          onClose={() => setEditingAdmin(null)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

export default AdminManagement;