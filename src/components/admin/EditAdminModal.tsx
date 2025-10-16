import React, { useState } from 'react';
import { Button, Input, Card } from '../ui';
import { type Admin, type UpdateUserRequest } from '../../types/user';
import styles from './EditAdminModal.module.css';

interface EditAdminModalProps {
  admin: Admin;
  onClose: () => void;
  onUpdate: (adminId: string, updates: UpdateUserRequest) => void;
}

const EditAdminModal: React.FC<EditAdminModalProps> = ({ admin, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: admin.name,
    email: admin.email,
    isActive: admin.isActive
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<typeof formData> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUpdate(admin.id, formData);
      onClose();
    } catch (error) {
      console.error('Failed to update admin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = () => {
    return formData.name !== admin.name ||
           formData.email !== admin.email ||
           formData.isActive !== admin.isActive;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <Card className={styles.card}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h2>✏️ Edit Admin</h2>
              <p>Update admin information and permissions</p>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.adminInfo}>
              <div className={styles.adminAvatar}>
                {admin.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className={styles.adminDetails}>
                <h3>Admin ID: {admin.id}</h3>
                <p>Created: {admin.createdAt.toLocaleDateString()}</p>
                <p>Managing {admin.managedBarbershops.length} barbershops</p>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="name">Full Name *</label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter admin's full name"
                disabled={isLoading}
                className={errors.name ? styles.inputError : ''}
              />
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address *</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter admin's email address"
                disabled={isLoading}
                className={errors.email ? styles.inputError : ''}
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>
                  Account Active
                  <small>Admin can log in and manage barbershops</small>
                </span>
              </label>
            </div>

            <div className={styles.managedShops}>
              <h4>Managed Barbershops</h4>
              <div className={styles.shopsGrid}>
                {admin.managedBarbershops.length > 0 ? (
                  admin.managedBarbershops.map((shopId, index) => (
                    <div key={shopId} className={styles.shopBadge}>
                      Barbershop #{index + 1}
                    </div>
                  ))
                ) : (
                  <p className={styles.noShops}>No barbershops assigned yet</p>
                )}
              </div>
            </div>

            <div className={styles.actions}>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !hasChanges()}
                className={styles.submitButton}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Updating...
                  </>
                ) : (
                  '💾 Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditAdminModal;