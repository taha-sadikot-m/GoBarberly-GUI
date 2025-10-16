import React, { useState } from 'react';
import { Button, Input, Card } from '../ui';
import { type CreateBarbershopRequest } from '../../types/user';
import styles from './AddBarbershopModal.module.css';

interface AddBarbershopModalProps {
  onClose: () => void;
  onAdd: (barbershopData: CreateBarbershopRequest) => void;
}

const AddBarbershopModal: React.FC<AddBarbershopModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState<CreateBarbershopRequest>({
    email: '',
    shopName: '',
    shopOwnerName: '',
    address: '',
    phone: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateBarbershopRequest & { confirmPassword: string }>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
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
    const newErrors: Partial<CreateBarbershopRequest & { confirmPassword: string }> = {};

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

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm the password';
    } else if (confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const barbershopData = {
        ...formData,
        shopLogo: logoFile || undefined
      };
      
      onAdd(barbershopData);
      onClose();
    } catch (error) {
      console.error('Failed to create barbershop:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <Card className={styles.card}>
          <div className={styles.header}>
            <h2>🏪 Add New Barbershop</h2>
            <button className={styles.closeButton} onClick={onClose}>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.logoSection}>
              <label className={styles.logoLabel}>Shop Logo (Optional)</label>
              <div className={styles.logoUpload}>
                {logoPreview ? (
                  <div className={styles.logoPreview}>
                    <img src={logoPreview} alt="Logo preview" />
                    <button 
                      type="button" 
                      className={styles.removeLogoButton}
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview('');
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className={styles.logoPlaceholder}>
                    <span>📷</span>
                    <p>Click to upload logo</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className={styles.logoInput}
                />
              </div>
              {errors.shopLogo && <span className={styles.error}>{String(errors.shopLogo)}</span>}
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

            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="password">Password *</label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create account password"
                  disabled={isLoading}
                  className={errors.password ? styles.inputError : ''}
                />
                {errors.password && <span className={styles.error}>{errors.password}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Confirm the password"
                  disabled={isLoading}
                  className={errors.confirmPassword ? styles.inputError : ''}
                />
                {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
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
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Creating Barbershop...
                  </>
                ) : (
                  '🏪 Create Barbershop'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddBarbershopModal;