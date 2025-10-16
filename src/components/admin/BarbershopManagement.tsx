import React, { useState } from 'react';
import { Button, Input, Card } from '../ui';
import { type Barbershop } from '../../types/user';
import AddBarbershopModal from './AddBarbershopModal';
import EditBarbershopModal from './EditBarbershopModal';
import styles from './BarbershopManagement.module.css';

interface BarbershopManagementProps {
  barbershops: Barbershop[];
  onAdd: (barbershopData: any) => void;
  onUpdate: (barbershopId: string, updates: any) => void;
  onDelete: (barbershopId: string) => void;
}

const BarbershopManagement: React.FC<BarbershopManagementProps> = ({
  barbershops,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBarbershop, setEditingBarbershop] = useState<Barbershop | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredBarbershops = barbershops.filter(barbershop =>
    barbershop.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barbershop.shopOwnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barbershop.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (barbershopId: string) => {
    if (confirmDelete === barbershopId) {
      onDelete(barbershopId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(barbershopId);
      // Clear confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const toggleBarbershopStatus = (barbershop: Barbershop) => {
    onUpdate(barbershop.id, { isActive: !barbershop.isActive });
  };

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
            Active: {barbershops.filter(b => b.isActive).length}
          </span>
        </div>
      </div>

      <div className={styles.barbershopGrid}>
        {filteredBarbershops.map((barbershop) => (
          <Card key={barbershop.id} className={styles.barbershopCard}>
            <div className={styles.barbershopHeader}>
              <div className={styles.shopLogo}>
                {barbershop.shopLogo ? (
                  <img src={barbershop.shopLogo} alt={barbershop.shopName} />
                ) : (
                  <div className={styles.logoPlaceholder}>
                    {barbershop.shopName.split(' ').map(word => word[0]).join('').toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.shopInfo}>
                <h3>{barbershop.shopName}</h3>
                <p>👤 {barbershop.shopOwnerName}</p>
                <p>📧 {barbershop.email}</p>
              </div>
              <div className={styles.shopStatus}>
                <span 
                  className={`${styles.statusBadge} ${barbershop.isActive ? styles.active : styles.inactive}`}
                >
                  {barbershop.isActive ? 'Active' : 'Inactive'}
                </span>
                {barbershop.subscription && (
                  <span 
                    className={`${styles.subscriptionBadge} ${styles[getStatusColor(barbershop.subscription.status)]}`}
                  >
                    {barbershop.subscription.plan} - {barbershop.subscription.status}
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
              {barbershop.phone && (
                <div className={styles.detailItem}>
                  <span className={styles.label}>📞 Phone:</span>
                  <span>{barbershop.phone}</span>
                </div>
              )}
              <div className={styles.detailItem}>
                <span className={styles.label}>📅 Created:</span>
                <span>{barbershop.createdAt.toLocaleDateString()}</span>
              </div>
              {barbershop.subscription && (
                <div className={styles.detailItem}>
                  <span className={styles.label}>⏰ Subscription Expires:</span>
                  <span>{barbershop.subscription.expiresAt.toLocaleDateString()}</span>
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
                className={barbershop.isActive ? styles.deactivateButton : styles.activateButton}
              >
                {barbershop.isActive ? '🔒 Deactivate' : '🔓 Activate'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleDelete(barbershop.id)}
                className={`${styles.deleteButton} ${confirmDelete === barbershop.id ? styles.confirmDelete : ''}`}
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
          onAdd={onAdd}
        />
      )}

      {/* Edit Barbershop Modal */}
      {editingBarbershop && (
        <EditBarbershopModal
          barbershop={editingBarbershop}
          onClose={() => setEditingBarbershop(null)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

export default BarbershopManagement;