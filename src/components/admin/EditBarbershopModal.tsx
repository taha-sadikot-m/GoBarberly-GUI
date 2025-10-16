import React, { useState } from 'react';
import { Button, Input, Card } from '../ui';
import { type Barbershop, type UpdateBarbershopRequest } from '../../types/user';
import styles from './EditBarbershopModal.module.css';

interface EditBarbershopModalProps {
  barbershop: Barbershop;
  onClose: () => void;
  onUpdate: (barbershopId: string, updates: UpdateBarbershopRequest) => void;
}

const EditBarbershopModal: React.FC<EditBarbershopModalProps> = ({ barbershop, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: barbershop.name,
    email: barbershop.email,
    shopName: barbershop.shopName,
    shopOwnerName: barbershop.shopOwnerName,
    address: barbershop.address || '',
    phone: barbershop.phone || '',
    isActive: barbershop.isActive
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(barbershop.shopLogo || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof formData & { shopLogo: string }>>({});

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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, shopLogo: 'Logo file must be less than 5MB' }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, shopLogo: 'Please select an image file' }));
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors
      setErrors(prev => ({ ...prev, shopLogo: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<typeof formData> = {};

    // Shop name validation
    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
    } else if (formData.shopName.trim().length < 2) {
      newErrors.shopName = 'Shop name must be at least 2 characters';
    }

    // Owner name validation
    if (!formData.shopOwnerName.trim()) {
      newErrors.shopOwnerName = 'Owner name is required';
    } else if (formData.shopOwnerName.trim().length < 2) {
      newErrors.shopOwnerName = 'Owner name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updates = {
        ...formData,
        shopLogo: logoFile || (logoPreview !== barbershop.shopLogo ? logoPreview : undefined)
      };
      
      onUpdate(barbershop.id, updates);
      onClose();
    } catch (error) {
      console.error('Failed to update barbershop:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = () => {
    return formData.shopName !== barbershop.shopName ||
           formData.shopOwnerName !== barbershop.shopOwnerName ||
           formData.email !== barbershop.email ||
           formData.address !== (barbershop.address || '') ||
           formData.phone !== (barbershop.phone || '') ||
           formData.isActive !== barbershop.isActive ||
           logoFile !== null ||
           logoPreview !== barbershop.shopLogo;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <Card className={styles.card}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h2>✏️ Edit Barbershop</h2>
              <p>Update barbershop information and settings</p>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.shopInfo}>
              <div className={styles.currentLogo}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Shop logo" />
                ) : (
                  <div className={styles.logoPlaceholder}>
                    {barbershop.shopName.split(' ').map(word => word[0]).join('').toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.shopDetails}>
                <h3>Barbershop ID: {barbershop.id}</h3>
                <p>Created: {barbershop.createdAt.toLocaleDateString()}</p>
                <p>Subscription: {barbershop.subscription?.plan} ({barbershop.subscription?.status})</p>
              </div>
            </div>

            <div className={styles.logoSection}>
              <label className={styles.logoLabel}>Update Shop Logo</label>
              <div className={styles.logoUpload}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className={styles.logoInput}
                />
                <span>📷 Choose new logo</span>
              </div>
              {errors.shopLogo && <span className={styles.error}>{errors.shopLogo}</span>}
            </div>

            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="shopName">Shop Name *</label>
                <Input
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  placeholder="Enter barbershop name"
                  disabled={isLoading}
                  className={errors.shopName ? styles.inputError : ''}
                />
                {errors.shopName && <span className={styles.error}>{errors.shopName}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="shopOwnerName">Owner Name *</label>
                <Input
                  id="shopOwnerName"
                  name="shopOwnerName"
                  value={formData.shopOwnerName}
                  onChange={handleChange}
                  placeholder="Enter owner's full name"
                  disabled={isLoading}
                  className={errors.shopOwnerName ? styles.inputError : ''}
                />
                {errors.shopOwnerName && <span className={styles.error}>{errors.shopOwnerName}</span>}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address *</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                disabled={isLoading}
                className={errors.email ? styles.inputError : ''}
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="phone">Phone Number</label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  disabled={isLoading}
                  className={errors.phone ? styles.inputError : ''}
                />
                {errors.phone && <span className={styles.error}>{errors.phone}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="address">Address</label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter shop address"
                  disabled={isLoading}
                />
              </div>
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
                  <small>Barbershop can log in and use the system</small>
                </span>
              </label>
            </div>

            <div className={styles.subscriptionInfo}>
              <h4>Subscription Details</h4>
              <div className={styles.subscriptionDetails}>
                <div className={styles.subscriptionItem}>
                  <span className={styles.label}>Plan:</span>
                  <span className={styles.planBadge}>
                    {barbershop.subscription?.plan || 'No Plan'}
                  </span>
                </div>
                <div className={styles.subscriptionItem}>
                  <span className={styles.label}>Status:</span>
                  <span className={`${styles.statusBadge} ${styles[barbershop.subscription?.status || 'inactive']}`}>
                    {barbershop.subscription?.status || 'Inactive'}
                  </span>
                </div>
                <div className={styles.subscriptionItem}>
                  <span className={styles.label}>Expires:</span>
                  <span>{barbershop.subscription?.expiresAt.toLocaleDateString() || 'N/A'}</span>
                </div>
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

export default EditBarbershopModal;